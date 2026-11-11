import test from 'node:test';
import assert from 'node:assert/strict';

import {
  addCostEntry,
  applyCostEvent,
  applyCostTimeline,
  contextMultipliers,
  costStateSchema,
  costViewSchema,
  emptyCostState,
  estimateCostNanos,
  normalizeBillingRange,
  normalizeUsage,
  priceRates,
  viewCostState,
} from '../plugin/index.js';

const TOKEN_PRICE = {
  billing_mode: 'token',
  cost: {
    input: 0.1275,
    output: 0.51,
    cached_input: 0.00255,
    cache_read: 0.00255,
    cache_creation: 0.004,
  },
};

test('base request matches the live billing amount within rounding', () => {
  const usage = normalizeUsage({ inputTokens: 31, outputTokens: 1 });
  // Live billing for this request was $0.00000446; nano-dollar rounding adds
  // three units at most.
  assert.equal(estimateCostNanos(TOKEN_PRICE, usage), 4_463);
});

test('cache read and cache write use their own prices', () => {
  const usage = normalizeUsage({
    inputTokens: 1_000_000,
    outputTokens: 1_000_000,
    cacheReadTokens: 1_000_000,
    cacheWriteTokens: 1_000_000,
  });
  // 1M input ($0.1275) + 1M output ($0.51) + 1M cache read ($0.00255)
  // + 1M cache write ($0.004).
  assert.equal(estimateCostNanos(TOKEN_PRICE, usage), 644_050_000);
});

test('missing cache prices fall back to cached_input or input', () => {
  const rates = priceRates({
    cost: { input: 1, output: 2, cached_input: 0.25 },
  });
  assert.deepEqual(rates, {
    input: 1,
    output: 2,
    cacheRead: 0.25,
    cacheWrite: 0.25,
  });
});

test('context tiers apply the highest exceeded threshold', () => {
  const price = {
    cost: { input: 1, output: 1 },
    context_tier_pricing: {
      threshold_tokens: 1_000,
      input_multiplier: 2,
      output_multiplier: 3,
      additional_tiers: [
        { threshold_tokens: 5_000, input_multiplier: 4, output_multiplier: 5 },
      ],
    },
  };
  assert.deepEqual(contextMultipliers(price, 2_000), { input: 2, output: 3 });
  assert.deepEqual(contextMultipliers(price, 6_000), { input: 4, output: 5 });
  assert.deepEqual(contextMultipliers(price, 1_000), { input: 1, output: 1 });
  assert.equal(
    estimateCostNanos(price, normalizeUsage({ inputTokens: 2_000, outputTokens: 1_000 })),
    7_000_000,
  );
});

test('unknown or image pricing stays unpriced', () => {
  assert.equal(estimateCostNanos(undefined, normalizeUsage({ inputTokens: 1 })), null);
  assert.equal(
    estimateCostNanos({ billing_mode: 'per_image', cost: {} }, normalizeUsage({ inputTokens: 1 })),
    null,
  );
});

test('negative and missing token values normalize to zero', () => {
  assert.deepEqual(normalizeUsage({ inputTokens: -5, outputTokens: undefined }), {
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    reasoningTokens: 0,
  });
});

test('wire view exposes message, turn and session costs', () => {
  const bucket = emptyCostState().total;
  const entry = {
    turn: 1,
    step: 1,
    provider: 'teamorouter',
    model: 'deepseek-flash-1017',
    costNanos: 1_234_567,
    tokens: 10,
    usage: normalizeUsage({ inputTokens: 5, outputTokens: 5 }),
  };
  const state = {
    ...emptyCostState(),
    messages: { message: entry },
    turns: { 1: addCostEntry(bucket, entry) },
    total: addCostEntry(bucket, entry),
  };
  const view = viewCostState(state);
  assert.equal(view.session.cost, 0.001234567);
  assert.equal(view.messages.message.cost, 0.001234567);
  assert.equal(view.messages.message.priced, true);
  assert.equal(view.turns['1'].cost, 0.001234567);
  assert.equal(view.session.requests, 1);
  assert.equal(view.session.unpriced, 0);
});

// ---------------------------------------------------------------------------
// Projection-level edge cases
// ---------------------------------------------------------------------------

function assistantEvent({ id, provider = 'teamorouter', model, usage, turn = 1, step = 1 }) {
  return {
    type: 'assistant/message',
    data: {
      turn,
      step,
      message: { id, source: { provider, model } },
      usage,
    },
  };
}

function tokenPrice(input, output, extra = {}) {
  return { billing_mode: 'token', cost: { input, output }, ...extra };
}

test('model switch inside one turn keeps per-message and per-turn costs', () => {
  const pricing = new Map([
    ['cheap', tokenPrice(1, 1)],
    ['expensive', tokenPrice(10, 10)],
  ]);
  const providers = new Set(['teamorouter', 'teamorouter-anthropic']);
  const usage = { inputTokens: 1_000_000, outputTokens: 1_000_000 };

  let state = emptyCostState();
  state = applyCostEvent(state, assistantEvent({ id: 'm1', model: 'cheap', usage, turn: 1, step: 1 }), pricing, providers);
  state = applyCostEvent(state, assistantEvent({
    id: 'm2',
    provider: 'teamorouter-anthropic',
    model: 'expensive',
    usage,
    turn: 1,
    step: 2,
  }), pricing, providers);
  // A different provider and a tool event must not contribute.
  state = applyCostEvent(state, assistantEvent({
    id: 'm3',
    provider: 'deepseek',
    model: 'cheap',
    usage,
    turn: 1,
    step: 3,
  }), pricing, providers);
  state = applyCostEvent(state, { type: 'tool/call', data: { turn: 1, step: 3 } }, pricing, providers);

  assert.equal(state.total.requests, 2);
  assert.equal(state.total.costNanos, 2_000_000_000 + 20_000_000_000);
  assert.equal(state.turns['1'].requests, 2);
  assert.equal(state.turns['1'].costNanos, 22_000_000_000);
  assert.equal(state.messages.m1.costNanos, 2_000_000_000);
  assert.equal(state.messages.m2.costNanos, 20_000_000_000);
  assert.equal(state.messages.m3, undefined);
});

test('a repeated message id replaces its cost instead of double counting', () => {
  const pricing = new Map([
    ['cheap', tokenPrice(1, 1)],
    ['expensive', tokenPrice(10, 10)],
  ]);
  const providers = new Set(['teamorouter']);
  const usage = { inputTokens: 1_000_000, outputTokens: 1_000_000 };

  let state = emptyCostState();
  state = applyCostEvent(state, assistantEvent({ id: 'm1', model: 'cheap', usage }), pricing, providers);
  state = applyCostEvent(state, assistantEvent({ id: 'm1', model: 'expensive', usage }), pricing, providers);

  assert.equal(state.total.requests, 1);
  assert.equal(state.total.costNanos, 20_000_000_000);
  assert.equal(state.turns['1'].requests, 1);
  assert.equal(state.messages.m1.costNanos, 20_000_000_000);
});

test('an unknown model is counted as unpriced, not as zero-priced', () => {
  const pricing = new Map([['known', tokenPrice(1, 1)]]);
  const providers = new Set(['teamorouter']);
  const usage = { inputTokens: 1_000_000, outputTokens: 1_000_000 };

  let state = emptyCostState();
  state = applyCostEvent(state, assistantEvent({ id: 'unknown', model: 'missing', usage }), pricing, providers);
  state = applyCostEvent(state, assistantEvent({ id: 'known', model: 'known', usage }), pricing, providers);
  const view = viewCostState(state);

  assert.equal(view.session.requests, 2);
  assert.equal(view.session.unpriced, 1);
  assert.equal(view.session.cost, 2);
  assert.equal(view.messages.unknown.cost, null);
  assert.equal(view.messages.unknown.priced, false);
  assert.equal(view.messages.known.cost, 2);
});

test('an assistant message without usage is unpriced but still counted', () => {
  const pricing = new Map([['known', tokenPrice(1, 1)]]);
  const providers = new Set(['teamorouter']);
  let state = emptyCostState();
  state = applyCostEvent(state, assistantEvent({ id: 'm1', model: 'known', usage: undefined }), pricing, providers);
  const view = viewCostState(state);
  assert.equal(view.session.requests, 1);
  assert.equal(view.session.unpriced, 1);
  assert.equal(view.messages.m1.priced, false);
  assert.equal(view.messages.m1.cost, null);
});

test('long context uses the highest tier and stays finite', () => {
  const price = tokenPrice(1, 1, {
    context_tier_pricing: {
      threshold_tokens: 100_000,
      input_multiplier: 2,
      output_multiplier: 1.5,
      additional_tiers: [
        { threshold_tokens: 1_000_000, input_multiplier: 4, output_multiplier: 3 },
      ],
    },
  });
  const usage = normalizeUsage({ inputTokens: 1_200_000, outputTokens: 100_000 });
  assert.deepEqual(contextMultipliers(price, 1_200_000), { input: 4, output: 3 });
  assert.equal(estimateCostNanos(price, usage), 5_100_000_000);
  assert.ok(Number.isSafeInteger(estimateCostNanos(price, usage)));
});

test('peak/off-peak fields do not change the base estimate yet', () => {
  // TeamoRouter's cost is already discounted; the live request matched the
  // base formula exactly. Applying pricing_multiplier=0.5 here would halve the
  // display until the peak/off-peak schedule is verified.
  const price = tokenPrice(1, 1, {
    pricing_period: 'off_peak',
    pricing_multiplier: 0.5,
    off_peak_discount: 0.5,
  });
  const usage = normalizeUsage({ inputTokens: 1_000_000, outputTokens: 1_000_000 });
  assert.equal(estimateCostNanos(price, usage), 2_000_000_000);
});

test('session timestamps follow turn lifecycle and assistant messages', () => {
  let state = emptyCostState();
  state = applyCostTimeline(state, { type: 'turn/start', time: 1_000 });
  assert.equal(state.firstAt, 1_000);
  assert.equal(state.lastAt, 1_000);

  state = applyCostEvent(state, {
    type: 'assistant/message',
    time: 2_500,
    data: {
      turn: 1,
      step: 1,
      message: { id: 'm1', source: { provider: 'teamorouter', model: 'known' } },
      usage: { inputTokens: 10, outputTokens: 5 },
    },
  }, new Map([['known', tokenPrice(1, 1)]]), new Set(['teamorouter']));
  assert.equal(state.firstAt, 1_000);
  assert.equal(state.lastAt, 2_500);

  state = applyCostTimeline(state, { type: 'turn/start', time: 3_000 });
  assert.equal(state.firstAt, 1_000);
  assert.equal(state.lastAt, 3_000);

  state = applyCostTimeline(state, { type: 'turn/end', time: 4_000 });
  assert.equal(state.lastAt, 4_000);

  const view = viewCostState(state);
  assert.equal(view.session.startedAt, 1_000);
  assert.equal(view.session.updatedAt, 4_000);
});

test('billing reconciliation range is validated and bounded', () => {
  assert.deepEqual(normalizeBillingRange(1_000, 2_500), { start: 1_000, end: 2_500 });
  assert.deepEqual(normalizeBillingRange('1000.2', '2000.1'), { start: 1_000, end: 2_001 });
  assert.equal(normalizeBillingRange(2_000, 1_000), null);
  assert.equal(normalizeBillingRange(0, 0), null);
  assert.equal(normalizeBillingRange('x', 1_000), null);
  assert.equal(normalizeBillingRange(0, 91 * 86_400), null);
});

test('persisted state survives a JSON round-trip', () => {
  const pricing = new Map([['model', tokenPrice(2, 3)]]);
  const providers = new Set(['teamorouter']);
  let state = emptyCostState();
  state = applyCostEvent(state, assistantEvent({
    id: 'm1',
    model: 'model',
    usage: { inputTokens: 10_000, outputTokens: 2_000 },
    turn: 1,
    step: 1,
  }), pricing, providers);
  state = applyCostEvent(state, assistantEvent({
    id: 'm2',
    model: 'model',
    usage: { inputTokens: 20_000, outputTokens: 3_000, cacheReadTokens: 5_000 },
    turn: 2,
    step: 1,
  }), pricing, providers);

  const restored = JSON.parse(JSON.stringify(state));
  costStateSchema.parse(restored);
  assert.deepEqual(viewCostState(restored), viewCostState(state));
  assert.equal(viewCostState(restored).session.requests, 2);
  assert.equal(viewCostState(restored).turns['1'].requests, 1);
  assert.equal(viewCostState(restored).turns['2'].requests, 1);
});

test('structural schemas reject damaged projection cache rows', () => {
  assert.doesNotThrow(() => costStateSchema.parse(emptyCostState()));
  assert.throws(() => costStateSchema.parse(null));
  assert.throws(() => costStateSchema.parse({ messages: {}, turns: {}, total: null }));
  assert.throws(() => costStateSchema.parse({ messages: [], turns: {}, total: {} }));

  assert.doesNotThrow(() => costViewSchema.parse(viewCostState(emptyCostState())));
  assert.throws(() => costViewSchema.parse(null));
  assert.throws(() => costViewSchema.parse({ session: {}, turns: {} }));
});
