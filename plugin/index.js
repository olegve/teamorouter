import { randomUUID } from 'node:crypto';

const DEFAULTS = Object.freeze({
  apiKeyEnv: 'TEAMOROUTER_API_KEY',
  providerId: 'teamorouter',
  claudeProviderId: 'teamorouter-anthropic',
  openaiBaseURL: 'https://api.teamorouter.com/v1',
  anthropicBaseURL: 'https://api.teamorouter.com',
  billingBaseURL: 'https://api.teamorouter.com/v1',
  dashboardURL: 'https://teamorouter.com/dashboard?buy=1',
});

const NON_CHAT_MODEL = /(^|[-_.])(image|imagine|upscale|midjourney|mj|embed|embedding|rerank|tts|whisper|audio|video|jev)([-_.]|$)/i;
const VISION_MODEL = /(^claude-)|(^gpt-)|(^gemini-)|(vision)|(^qwen.*vl)/i;
const REASONING_MODEL = /(^deepseek-)|(^gpt-[5-9])|(^o[1-9])/i;

const trimSlash = (value) => String(value).replace(/\/+$/, '');

const asNumber = (value) => (typeof value === 'number' && Number.isFinite(value) ? value : undefined);

function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.models)) return data.models;
  if (data?.models && typeof data.models === 'object') {
    return Object.entries(data.models).map(([id, value]) =>
      value && typeof value === 'object' ? { id, ...value } : { id, name: String(value) });
  }
  if (data?.data && typeof data.data === 'object') {
    return Object.entries(data.data).map(([id, value]) =>
      value && typeof value === 'object' ? { id, ...value } : { id, name: String(value) });
  }
  return [];
}

function modelsFromResponse(data) {
  return normalizeList(data).flatMap((item) => {
    if (typeof item === 'string') return [{ id: item }];
    if (!item || typeof item !== 'object') return [];
    const id = item.id ?? item.name ?? item.model;
    if (typeof id !== 'string' || id.length === 0) return [];
    return [{
      id,
      name: typeof item.name === 'string'
        ? item.name
        : (typeof item.display_name === 'string' ? item.display_name : undefined),
      ownedBy: typeof item.owned_by === 'string' ? item.owned_by : undefined,
      contextWindow: asNumber(item.context_window ?? item.contextWindow),
      maxTokens: asNumber(item.max_output_tokens ?? item.maxTokens),
    }];
  });
}

function mergeModel(existing, discovered) {
  const merged = { ...discovered, ...existing };
  if (existing.contextWindow === undefined && discovered.contextWindow !== undefined) {
    merged.contextWindow = discovered.contextWindow;
  }
  if (existing.maxTokens === undefined && discovered.maxTokens !== undefined) {
    merged.maxTokens = discovered.maxTokens;
  }
  if (existing.reasoningEfforts === undefined && discovered.reasoningEfforts !== undefined) {
    merged.reasoningEfforts = discovered.reasoningEfforts;
  }
  const existingInput = Array.isArray(existing.input) ? existing.input : undefined;
  const discoveredInput = Array.isArray(discovered.input) ? discovered.input : undefined;
  if (discoveredInput?.includes('image')
      && (existingInput === undefined || (existingInput.length === 1 && existingInput[0] === 'text'))) {
    merged.input = discoveredInput;
  }
  return merged;
}

function mergeModels(existing, discovered) {
  const byId = new Map();
  for (const model of Array.isArray(existing) ? existing : []) {
    if (model && typeof model === 'object' && typeof model.id === 'string') byId.set(model.id, model);
  }
  for (const model of discovered) {
    const current = byId.get(model.id);
    byId.set(model.id, current === undefined ? model : mergeModel(current, model));
  }
  return [...byId.values()];
}

function modelConfig(item, price) {
  const model = {
    id: item.id,
    name: item.name || (typeof price?.display_name === 'string' ? price.display_name : item.id),
    input: VISION_MODEL.test(item.id) ? ['text', 'image'] : ['text'],
  };
  const contextWindow = asNumber(item.contextWindow ?? price?.context_window);
  const maxTokens = asNumber(item.maxTokens ?? price?.max_output_tokens);
  if (contextWindow !== undefined && contextWindow > 0) model.contextWindow = Math.round(contextWindow);
  if (maxTokens !== undefined && maxTokens > 0) model.maxTokens = Math.round(maxTokens);
  if (REASONING_MODEL.test(item.id)) {
    model.reasoningEfforts = { off: null, low: 'low', medium: 'medium', high: 'high' };
  }
  return model;
}

function modelSummary(model, protocol) {
  return {
    id: model.id,
    name: model.name || model.id,
    protocol,
    contextWindow: asNumber(model.contextWindow),
    maxTokens: asNumber(model.maxTokens),
    input: Array.isArray(model.input) ? model.input : ['text'],
    reasoning: Boolean(model.reasoningEfforts),
  };
}

function isChatModel(item, price) {
  if (price?.billing_mode === 'per_image') return false;
  const owner = String(price?.owned_by || item.ownedBy || '').toLowerCase();
  if (owner === 'midjourney' || owner === 'typesafe') return false;
  if (/nano-banana/i.test(item.id)) return false;
  if (NON_CHAT_MODEL.test(item.id)) return false;
  return true;
}

function isClaudeModel(item, price) {
  if (item.id.toLowerCase().startsWith('claude-')) return true;
  return String(price?.owned_by || item.ownedBy || '').toLowerCase() === 'anthropic';
}

const COST_PROJECTION_KEY = 'teamorouterCost';
const COST_NANO = 1_000_000_000;

// The projection service validates state and wire values through `parse`.
// These values are produced by this plugin only, so a small structural schema
// is enough; keeping it local avoids an extra runtime dependency in the bundle.
export const costStateSchema = {
  parse(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)
        || value.messages === null || typeof value.messages !== 'object'
        || Array.isArray(value.messages)
        || value.turns === null || typeof value.turns !== 'object'
        || Array.isArray(value.turns)
        || value.total === null || typeof value.total !== 'object'
        || Array.isArray(value.total)) {
      throw new Error('invalid teamorouter cost state');
    }
    return value;
  },
};

export const costViewSchema = {
  parse(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value)
        || value.session === null || typeof value.session !== 'object'
        || Array.isArray(value.session)
        || value.turns === null || typeof value.turns !== 'object'
        || Array.isArray(value.turns)
        || value.messages === null || typeof value.messages !== 'object'
        || Array.isArray(value.messages)) {
      throw new Error('invalid teamorouter cost view');
    }
    return value;
  },
};

function tokenCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 0;
}

function positiveMultiplier(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : 1;
}

export function normalizeUsage(usage) {
  return {
    inputTokens: tokenCount(usage?.inputTokens),
    outputTokens: tokenCount(usage?.outputTokens),
    cacheReadTokens: tokenCount(usage?.cacheReadTokens),
    cacheWriteTokens: tokenCount(usage?.cacheWriteTokens),
    reasoningTokens: tokenCount(usage?.reasoningTokens),
  };
}

function usageTotal(usage) {
  return usage.inputTokens + usage.outputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
}

export function priceRates(price) {
  if (!price || price.billing_mode === 'per_image' || !price.cost) return null;
  const input = Number(price.cost.input);
  const output = Number(price.cost.output);
  if (!Number.isFinite(input) || !Number.isFinite(output) || input < 0 || output < 0) return null;
  const cacheRead = Number(price.cost.cache_read ?? price.cost.cached_input ?? input);
  const cacheWrite = Number(price.cost.cache_creation ?? price.cost.cached_input ?? input);
  return {
    input,
    output,
    cacheRead: Number.isFinite(cacheRead) && cacheRead >= 0 ? cacheRead : input,
    cacheWrite: Number.isFinite(cacheWrite) && cacheWrite >= 0 ? cacheWrite : input,
  };
}

export function contextMultipliers(price, promptTokens) {
  const tier = price?.context_tier_pricing;
  if (!tier || !Number.isFinite(Number(tier.threshold_tokens))) return { input: 1, output: 1 };
  const candidates = [tier, ...(Array.isArray(tier.additional_tiers) ? tier.additional_tiers : [])];
  let best = null;
  for (const candidate of candidates) {
    const threshold = Number(candidate?.threshold_tokens);
    if (Number.isFinite(threshold) && promptTokens > threshold
        && (best === null || threshold > best.threshold)) {
      best = { threshold, candidate };
    }
  }
  if (!best) return { input: 1, output: 1 };
  return {
    input: positiveMultiplier(best.candidate.input_multiplier),
    output: positiveMultiplier(best.candidate.output_multiplier),
  };
}

// TeamoRouter returns `cost` already discounted for the account. We verified
// a live request against GET /v1/billing/requests/{id}: the base formula
// matched to the cent, without applying the optional peak/off-peak multiplier.
// Keep this estimate on the same base until the multiplier semantics are
// verified; applying it blindly can halve the displayed cost.
export function estimateCostNanos(price, usage) {
  const rates = priceRates(price);
  if (!rates) return null;
  const promptTokens = usage.inputTokens + usage.cacheReadTokens + usage.cacheWriteTokens;
  const multiplier = contextMultipliers(price, promptTokens);
  const dollars =
      usage.inputTokens / 1e6 * rates.input * multiplier.input
    + usage.cacheReadTokens / 1e6 * rates.cacheRead * multiplier.input
    + usage.cacheWriteTokens / 1e6 * rates.cacheWrite * multiplier.input
    + usage.outputTokens / 1e6 * rates.output * multiplier.output;
  if (!Number.isFinite(dollars) || dollars < 0) return null;
  return Math.round(dollars * COST_NANO);
}

function emptyCostBucket() {
  return {
    costNanos: 0,
    requests: 0,
    unpriced: 0,
    tokens: 0,
    inputTokens: 0,
    outputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
  };
}

export function emptyCostState() {
  return {
    currency: 'USD',
    messages: {},
    turns: {},
    total: emptyCostBucket(),
    firstAt: null,
    lastAt: null,
  };
}

export function addCostEntry(bucket, entry) {
  return {
    costNanos: bucket.costNanos + (entry.costNanos ?? 0),
    requests: bucket.requests + 1,
    unpriced: bucket.unpriced + (entry.costNanos === null ? 1 : 0),
    tokens: bucket.tokens + entry.tokens,
    inputTokens: bucket.inputTokens + entry.usage.inputTokens,
    outputTokens: bucket.outputTokens + entry.usage.outputTokens,
    cacheReadTokens: bucket.cacheReadTokens + entry.usage.cacheReadTokens,
    cacheWriteTokens: bucket.cacheWriteTokens + entry.usage.cacheWriteTokens,
  };
}

export function removeCostEntry(bucket, entry) {
  return {
    costNanos: bucket.costNanos - (entry.costNanos ?? 0),
    requests: bucket.requests - 1,
    unpriced: bucket.unpriced - (entry.costNanos === null ? 1 : 0),
    tokens: bucket.tokens - entry.tokens,
    inputTokens: bucket.inputTokens - entry.usage.inputTokens,
    outputTokens: bucket.outputTokens - entry.usage.outputTokens,
    cacheReadTokens: bucket.cacheReadTokens - entry.usage.cacheReadTokens,
    cacheWriteTokens: bucket.cacheWriteTokens - entry.usage.cacheWriteTokens,
  };
}

function viewCostBucket(bucket) {
  return {
    cost: bucket.costNanos / COST_NANO,
    requests: bucket.requests,
    unpriced: bucket.unpriced,
    tokens: bucket.tokens,
    inputTokens: bucket.inputTokens,
    outputTokens: bucket.outputTokens,
    cacheReadTokens: bucket.cacheReadTokens,
    cacheWriteTokens: bucket.cacheWriteTokens,
  };
}

export function viewCostState(costState) {
  const turns = {};
  for (const [turn, bucket] of Object.entries(costState.turns)) {
    turns[turn] = viewCostBucket(bucket);
  }
  const messages = {};
  for (const [messageId, message] of Object.entries(costState.messages)) {
    messages[messageId] = {
      cost: message.costNanos === null ? null : message.costNanos / COST_NANO,
      priced: message.costNanos !== null,
      provider: message.provider,
      model: message.model,
      turn: message.turn,
      step: message.step,
      tokens: message.tokens,
      usage: message.usage,
    };
  }
  return {
    currency: costState.currency,
    session: {
      ...viewCostBucket(costState.total),
      startedAt: costState.firstAt ?? null,
      updatedAt: costState.lastAt ?? null,
    },
    turns,
    messages,
  };
}

export function applyCostEvent(costState, event, pricing, providers) {
  if (event?.type !== 'assistant/message') return costState;
  const message = event.data?.message;
  const source = message?.source;
  if (!source || !providers.has(source.provider)) return costState;
  if (typeof message.id !== 'string' || message.id.length === 0) return costState;

  const usage = normalizeUsage(event.data.usage);
  const hasUsage = event.data.usage !== undefined && event.data.usage !== null;
  const price = pricing.get(source.model)
    ?? pricing.get(source.replayState?.response?.responseModel);
  const costNanos = hasUsage && price ? estimateCostNanos(price, usage) : null;
  const entry = {
    turn: Number(event.data.turn) || 0,
    step: Number(event.data.step) || 0,
    provider: source.provider,
    model: source.model,
    costNanos,
    tokens: usageTotal(usage),
    usage,
  };

  const previous = costState.messages[message.id];
  let total = costState.total;
  const turns = { ...costState.turns };
  if (previous) {
    total = removeCostEntry(total, previous);
    const previousTurn = turns[previous.turn] ?? emptyCostBucket();
    turns[previous.turn] = removeCostEntry(previousTurn, previous);
  }
  total = addCostEntry(total, entry);
  const turn = turns[entry.turn] ?? emptyCostBucket();
  turns[entry.turn] = addCostEntry(turn, entry);

  const eventTime = Number.isFinite(event.time) ? event.time : null;
  return {
    ...costState,
    firstAt: costState.firstAt ?? eventTime,
    lastAt: eventTime ?? costState.lastAt,
    messages: { ...costState.messages, [message.id]: entry },
    turns,
    total,
  };
}

export function normalizeBillingRange(start, end) {
  const from = Number(start);
  const to = Number(end);
  if (!Number.isFinite(from) || !Number.isFinite(to)) return null;
  const startSec = Math.floor(from);
  const endSec = Math.ceil(to);
  if (startSec < 0 || endSec <= startSec || endSec - startSec > 90 * 86_400) return null;
  return { start: startSec, end: endSec };
}

export function applyCostTimeline(costState, event) {
  const at = Number.isFinite(event?.time) ? event.time : null;
  if (at === null) return costState;
  if (event.type === 'turn/start') {
    return {
      ...costState,
      firstAt: costState.firstAt ?? at,
      lastAt: at,
    };
  }
  if (event.type === 'turn/end') return { ...costState, lastAt: at };
  return costState;
}

function classifyFailure(error) {
  if (error?.code === 'missing-key') {
    return { status: 401, code: 'missing-key', message: 'Ключ не найден в хранилище.' };
  }
  if (error?.status === 401 || error?.status === 403) {
    return { status: 401, code: 'invalid-key', message: 'Ключ неверный или отозван.' };
  }
  if (error?.status === 402) {
    return { status: 402, code: 'insufficient-balance', message: 'Баланс TeamoRouter исчерпан. Пополните счёт.' };
  }
  if (error?.status === 429) {
    return { status: 429, code: 'rate-limit', message: 'TeamoRouter ограничил частоту запросов. Попробуйте позже.' };
  }
  if (error?.status === 400) {
    return { status: 400, code: 'bad-request', message: 'TeamoRouter отклонил запрос.' };
  }
  if (typeof error?.status === 'number' && error.status >= 500) {
    return { status: 502, code: 'upstream', message: 'TeamoRouter временно недоступен.' };
  }
  return { status: 502, code: 'network', message: 'Не удалось связаться с TeamoRouter.' };
}

export const inject = ['settings', 'credentials'];

export async function apply(ctx, config = {}) {
  const cfg = { ...DEFAULTS, ...(config && typeof config === 'object' ? config : {}) };
  const webServer = ctx.get('webServer');
  if (!webServer) return;

  const token = randomUUID();
  const prefix = `/api/teamorouter/${token}`;
  const state = {
    balanceRef: '',
    balanceAt: 0,
    balance: null,
    pricingAt: 0,
    pricing: new Map(),
    costsKey: '',
    costsAt: 0,
    costs: null,
    sessionActualKey: '',
    sessionActualAt: 0,
    sessionActual: null,
  };

  function createCostProjection() {
    const providers = new Set([cfg.providerId, cfg.claudeProviderId]);
    return {
      key: COST_PROJECTION_KEY,
      stateVersion: 2,
      stateSchema: costStateSchema,
      init: () => emptyCostState(),
      apply: (costState, event) => applyCostTimeline(
        applyCostEvent(costState, event, state.pricing, providers),
        event,
      ),
      wire: {
        viewSchema: costViewSchema,
        view: (costState) => viewCostState(costState),
        summary: false,
      },
    };
  }

  function send(res, status, payload) {
    if (res.writableEnded || res.headersSent) return;
    res.writeHead(status, {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    });
    res.end(JSON.stringify(payload));
  }

  function fail(res, status, code, message, extra = {}) {
    send(res, status, { ok: false, error: { code, message }, ...extra });
  }

  function readBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.setEncoding('utf8');
      req.on('data', (chunk) => {
        body += chunk;
        if (body.length > 200_000) {
          reject(new Error('request body too large'));
          req.destroy();
        }
      });
      req.on('end', () => {
        if (body.length === 0) return resolve({});
        try {
          resolve(JSON.parse(body));
        } catch {
          reject(new Error('invalid JSON body'));
        }
      });
      req.on('error', reject);
    });
  }

  async function requestJson(url, options = {}, timeoutMs = 20_000) {
    let response;
    try {
      response = await fetch(url, { ...options, signal: AbortSignal.timeout(timeoutMs) });
    } catch (error) {
      const failure = new Error(error?.name === 'TimeoutError'
        ? 'TeamoRouter не ответил вовремя.'
        : 'Сетевая ошибка TeamoRouter.');
      failure.code = 'network';
      throw failure;
    }
    const text = await response.text();
    let data = null;
    try {
      data = text.length > 0 ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    if (!response.ok) {
      const failure = new Error(data?.error?.message || data?.message || `TeamoRouter HTTP ${response.status}`);
      failure.status = response.status;
      failure.code = data?.error?.code || data?.error?.type || 'http-error';
      throw failure;
    }
    return data;
  }

  async function fetchModels(key) {
    const data = await requestJson(`${trimSlash(cfg.openaiBaseURL)}/models`, {
      headers: { authorization: `Bearer ${key}` },
    });
    return modelsFromResponse(data);
  }

  async function fetchPricing() {
    const now = Date.now();
    if (now - state.pricingAt < 5 * 60_000) return state.pricing;
    try {
      const data = await requestJson(`${trimSlash(cfg.openaiBaseURL)}/models/pricing`);
      const next = new Map();
      for (const item of normalizeList(data)) {
        if (item && typeof item === 'object' && typeof item.id === 'string') next.set(item.id, item);
      }
      state.pricing = next;
      state.pricingAt = now;
    } catch {
      // Pricing is optional: model import still works without it.
    }
    return state.pricing;
  }

  async function fetchBalance(key) {
    const data = await requestJson(`${trimSlash(cfg.billingBaseURL)}/billing/balance`, {
      headers: { authorization: `Bearer ${key}` },
    });
    const balance = data?.balance;
    if (!balance || (typeof balance.value !== 'string' && typeof balance.value !== 'number')) {
      throw new Error('TeamoRouter вернул неожиданный ответ баланса.');
    }
    return {
      value: String(balance.value),
      currency: typeof balance.currency === 'string' ? balance.currency : 'USD',
    };
  }

  function localRanges() {
    const now = new Date();
    const end = Math.floor(now.getTime() / 1000);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const month = new Date(now.getFullYear(), now.getMonth(), 1);
    const todayStart = Math.floor(today.getTime() / 1000);
    const monthStart = Math.floor(month.getTime() / 1000);
    return {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'local',
      today: { start: todayStart, end: Math.max(end, todayStart + 1) },
      month: { start: monthStart, end: Math.max(end, monthStart + 1) },
    };
  }

  async function fetchCosts(key, range) {
    const query = new URLSearchParams({
      start_time: String(range.start),
      end_time: String(range.end),
    });
    const data = await requestJson(`${trimSlash(cfg.billingBaseURL)}/billing/costs?${query}`, {
      headers: { authorization: `Bearer ${key}` },
    });
    const amount = data?.total_amount;
    return {
      amount: {
        value: String(amount?.value ?? '0'),
        currency: typeof amount?.currency === 'string' ? amount.currency : 'USD',
      },
      requests: Number.isFinite(Number(data?.requests)) ? Number(data.requests) : 0,
    };
  }

  async function fetchUsage(key, range) {
    const query = new URLSearchParams({
      start_time: String(range.start),
      end_time: String(range.end),
    });
    const data = await requestJson(`${trimSlash(cfg.billingBaseURL)}/usage?${query}`, {
      headers: { authorization: `Bearer ${key}` },
    });
    const tokens = Number(data?.usage?.total_tokens);
    return { tokens: Number.isFinite(tokens) ? tokens : null };
  }

  async function costsFor(ref) {
    const ranges = localRanges();
    const now = Date.now();
    const cacheKey = `${ref}:${ranges.today.start}:${ranges.month.start}`;
    if (state.costsKey === cacheKey && now - state.costsAt < 60_000 && state.costs) {
      return state.costs;
    }
    const key = await resolveKey(ref);
    if (!key) {
      const failure = new Error('Ключ не найден в хранилище.');
      failure.code = 'missing-key';
      throw failure;
    }
    const [todayCost, monthCost, todayUsage, monthUsage] = await Promise.all([
      fetchCosts(key, ranges.today),
      fetchCosts(key, ranges.month),
      fetchUsage(key, ranges.today).catch(() => null),
      fetchUsage(key, ranges.month).catch(() => null),
    ]);
    const result = {
      timezone: ranges.timezone,
      today: {
        amount: todayCost.amount,
        requests: todayCost.requests,
        tokens: todayUsage?.tokens ?? null,
      },
      month: {
        amount: monthCost.amount,
        requests: monthCost.requests,
        tokens: monthUsage?.tokens ?? null,
      },
      updatedAt: now,
    };
    state.costsKey = cacheKey;
    state.costsAt = now;
    state.costs = result;
    return result;
  }

  function describeProvider() {
    const descriptor = ctx.settings.describe().find((row) => row.ns === 'llm-pi-ai');
    if (!descriptor) throw new Error('Настройки llm-pi-ai недоступны.');
    const providers = descriptor.value?.providers && typeof descriptor.value.providers === 'object'
      ? descriptor.value.providers
      : {};
    const openai = providers[cfg.providerId];
    const claude = providers[cfg.claudeProviderId];
    const ref = (openai && typeof openai.apiKeyEnv === 'string' && openai.apiKeyEnv)
      || (claude && typeof claude.apiKeyEnv === 'string' && claude.apiKeyEnv)
      || cfg.apiKeyEnv;
    return { descriptor, openai, claude, ref };
  }

  async function resolveKey(ref) {
    try {
      const hit = await ctx.credentials.resolve(ref);
      return typeof hit?.value === 'string' && hit.value.length > 0 ? hit.value : undefined;
    } catch {
      return undefined;
    }
  }

  async function balanceFor(ref) {
    const now = Date.now();
    if (state.balanceRef === ref && now - state.balanceAt < 30_000 && state.balance) {
      return { balance: state.balance, updatedAt: state.balanceAt };
    }
    const key = await resolveKey(ref);
    if (!key) {
      const failure = new Error('Ключ не найден в хранилище.');
      failure.code = 'missing-key';
      throw failure;
    }
    const balance = await fetchBalance(key);
    state.balanceRef = ref;
    state.balanceAt = now;
    state.balance = balance;
    return { balance, updatedAt: now };
  }

  async function handleStatus(res) {
    let info;
    try {
      info = describeProvider();
    } catch (error) {
      return fail(res, 503, 'settings-unavailable', error.message);
    }
    const { openai, claude, ref } = info;
    let keyConfigured = false;
    let keyWritable = true;
    try {
      const credential = await ctx.credentials.describe(ref);
      keyConfigured = credential?.configured === true;
      keyWritable = credential?.writable !== false;
    } catch {
      // A malformed reference behaves like an unconfigured key.
    }

    let balance = null;
    let balanceError = null;
    let balanceUpdatedAt = null;
    if (keyConfigured) {
      try {
        const result = await balanceFor(ref);
        balance = result.balance;
        balanceUpdatedAt = result.updatedAt;
      } catch (error) {
        balanceError = error?.message || 'Не удалось получить баланс.';
      }
    }

    const modelList = [
      ...(Array.isArray(openai?.models) ? openai.models : []).map((model) => ({
        ...modelSummary(model, 'openai-completions'),
        provider: cfg.providerId,
      })),
      ...(Array.isArray(claude?.models) ? claude.models : []).map((model) => ({
        ...modelSummary(model, 'anthropic-messages'),
        provider: cfg.claudeProviderId,
      })),
    ];
    let defaultModel = null;
    try {
      defaultModel = ctx.get('agentDefaultModel')?.currentSelection?.() ?? null;
    } catch {
      defaultModel = null;
    }

    send(res, 200, {
      ok: true,
      providerId: cfg.providerId,
      configured: Boolean(openai),
      claudeConfigured: Boolean(claude),
      models: Array.isArray(openai?.models) ? openai.models.length : 0,
      claudeModels: Array.isArray(claude?.models) ? claude.models.length : 0,
      apiKeyEnv: ref,
      keyConfigured,
      keyWritable,
      baseURL: openai?.baseURL || cfg.openaiBaseURL,
      dashboardURL: cfg.dashboardURL,
      modelList,
      defaultModel,
      balance,
      balanceError,
      balanceUpdatedAt,
    });
  }

  async function handleBalance(res) {
    let info;
    try {
      info = describeProvider();
    } catch (error) {
      return fail(res, 503, 'settings-unavailable', error.message);
    }
    try {
      const result = await balanceFor(info.ref);
      send(res, 200, { ok: true, balance: result.balance, updatedAt: result.updatedAt });
    } catch (error) {
      const failure = classifyFailure(error);
      fail(res, failure.status, failure.code, failure.message);
    }
  }

  async function handleCosts(res) {
    let info;
    try {
      info = describeProvider();
    } catch (error) {
      return fail(res, 503, 'settings-unavailable', error.message);
    }
    try {
      const result = await costsFor(info.ref);
      send(res, 200, { ok: true, ...result });
    } catch (error) {
      const failure = classifyFailure(error);
      fail(res, failure.status, failure.code, failure.message);
    }
  }

  async function handleSessionActual(req, res) {
    const url = new URL(req.url || '/', 'http://localhost');
    const range = normalizeBillingRange(url.searchParams.get('start'), url.searchParams.get('end'));
    if (!range) {
      return fail(res, 400, 'bad-range', 'Некорректный период сверки.');
    }
    const now = Date.now();
    const cacheKey = `${range.start}:${range.end}`;
    if (state.sessionActualKey === cacheKey
        && now - state.sessionActualAt < 30_000
        && state.sessionActual) {
      return send(res, 200, { ok: true, ...state.sessionActual });
    }
    let info;
    try {
      info = describeProvider();
    } catch (error) {
      return fail(res, 503, 'settings-unavailable', error.message);
    }
    try {
      const key = await resolveKey(info.ref);
      if (!key) {
        return fail(res, 401, 'missing-key', 'Ключ не найден в хранилище.');
      }
      const data = await fetchCosts(key, range);
      const result = {
        start: range.start,
        end: range.end,
        amount: data.amount,
        requests: data.requests,
        updatedAt: now,
      };
      state.sessionActualKey = cacheKey;
      state.sessionActualAt = now;
      state.sessionActual = result;
      send(res, 200, { ok: true, ...result });
    } catch (error) {
      const failure = classifyFailure(error);
      fail(res, failure.status, failure.code, failure.message);
    }
  }

  async function handleDefaultModel(req, res) {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return fail(res, 400, 'bad-request', 'Некорректный запрос.');
    }
    const provider = typeof body?.provider === 'string' ? body.provider : '';
    const model = typeof body?.model === 'string' ? body.model : '';
    if (provider.length === 0 || model.length === 0) {
      return fail(res, 400, 'bad-request', 'Нужны provider и model.');
    }
    let info;
    try {
      info = describeProvider();
    } catch (error) {
      return fail(res, 503, 'settings-unavailable', error.message);
    }
    const models = provider === cfg.providerId
      ? info.openai?.models
      : (provider === cfg.claudeProviderId ? info.claude?.models : undefined);
    if (!Array.isArray(models) || !models.some((item) => item?.id === model)) {
      return fail(res, 404, 'model-not-found', 'Модель не найдена в этом провайдере.');
    }
    const selection = ctx.get('agentDefaultModel');
    if (!selection?.saveSelection) {
      return fail(res, 503, 'default-model-unavailable', 'Сервис модели по умолчанию недоступен.');
    }
    try {
      await selection.saveSelection({ provider, model });
    } catch (error) {
      return fail(res, 500, 'default-model-write', error?.message || 'Не удалось сохранить модель по умолчанию.');
    }
    send(res, 200, { ok: true, selection: { provider, model } });
  }

  async function handleConnect(req, res) {
    let body;
    try {
      body = await readBody(req);
    } catch {
      return fail(res, 400, 'bad-request', 'Некорректный запрос.');
    }

    let info;
    try {
      info = describeProvider();
    } catch (error) {
      return fail(res, 503, 'settings-unavailable', error.message);
    }
    const { descriptor, openai, claude, ref } = info;

    if (openai?.api && openai.api !== 'openai-completions') {
      return fail(res, 409, 'protocol-conflict',
        `Провайдер ${cfg.providerId} уже использует протокол ${openai.api}; плагин ожидает openai-completions.`);
    }

    const useStoredKey = body?.useStoredKey === true;
    const includeClaude = body?.includeClaude !== false;
    let key = typeof body?.apiKey === 'string' ? body.apiKey.trim() : '';

    if (!useStoredKey) {
      if (key.length === 0) return fail(res, 400, 'missing-key', 'Введите API-ключ.');
      if (!/^sk-teamo-\S+$/.test(key) || key.length < 16) {
        return fail(res, 400, 'invalid-format', 'Ключ должен начинаться с sk-teamo- и не содержать пробелов.');
      }
    } else {
      key = (await resolveKey(ref)) || '';
      if (key.length === 0) return fail(res, 401, 'missing-key', 'Сохранённый ключ не найден.');
    }

    let models;
    try {
      models = await fetchModels(key);
    } catch (error) {
      const failure = classifyFailure(error);
      return fail(res, failure.status, failure.code, failure.message);
    }
    if (models.length === 0) {
      return fail(res, 502, 'no-models', 'Ключ принят, но TeamoRouter не вернул моделей.');
    }

    const pricing = await fetchPricing();
    const chatModels = models.filter((item) => isChatModel(item, pricing.get(item.id)));
    if (chatModels.length === 0) {
      return fail(res, 502, 'no-chat-models', 'В каталоге не нашлось чат-моделей для DSH.');
    }

    let claudeModels = includeClaude
      ? chatModels.filter((item) => isClaudeModel(item, pricing.get(item.id)))
      : [];
    let openaiModels = includeClaude
      ? chatModels.filter((item) => !isClaudeModel(item, pricing.get(item.id)))
      : chatModels;
    if (openaiModels.length === 0) {
      // A Claude-only catalog still needs one usable OpenAI-compatible route.
      openaiModels = chatModels;
      claudeModels = [];
    }

    const discoveredOpenai = openaiModels.map((item) => modelConfig(item, pricing.get(item.id)));
    const discoveredClaude = claudeModels.map((item) => modelConfig(item, pricing.get(item.id)));

    const openaiValue = openai
      ? {
          ...openai,
          displayName: openai.displayName || 'TeamoRouter',
          apiKeyEnv: ref,
          baseURL: openai.baseURL || cfg.openaiBaseURL,
          api: openai.api || 'openai-completions',
          models: mergeModels(openai.models, discoveredOpenai),
        }
      : {
          displayName: 'TeamoRouter',
          apiKeyEnv: ref,
          api: 'openai-completions',
          baseURL: cfg.openaiBaseURL,
          models: discoveredOpenai,
        };

    let claudeValue = null;
    if (claude || discoveredClaude.length > 0) {
      claudeValue = claude
        ? {
            ...claude,
            displayName: claude.displayName || 'TeamoRouter Claude',
            apiKeyEnv: ref,
            baseURL: claude.baseURL || cfg.anthropicBaseURL,
            api: claude.api || 'anthropic-messages',
            models: mergeModels(claude.models, discoveredClaude),
          }
        : {
            displayName: 'TeamoRouter Claude',
            apiKeyEnv: ref,
            api: 'anthropic-messages',
            baseURL: cfg.anthropicBaseURL,
            models: discoveredClaude,
          };
    }

    if (!useStoredKey) {
      let writable = true;
      try {
        const credential = await ctx.credentials.describe(ref);
        writable = credential?.writable !== false;
      } catch {
        writable = true;
      }
      if (!writable) {
        return fail(res, 409, 'key-not-writable', 'Ключ хранится в окружении и не может быть перезаписан.');
      }
      try {
        await ctx.credentials.set(ref, key);
      } catch {
        return fail(res, 500, 'key-write', 'Не удалось сохранить ключ.');
      }
    }

    const ops = [{ op: 'set', path: ['providers', cfg.providerId], value: openaiValue }];
    if (claudeValue) {
      ops.push({ op: 'set', path: ['providers', cfg.claudeProviderId], value: claudeValue });
    }

    try {
      await ctx.settings.mutate('llm-pi-ai', ops, descriptor.revision);
    } catch (error) {
      const conflict = /conflict|revision/i.test(String(error?.message));
      return fail(res, 409, 'settings-write',
        conflict
          ? 'Настройки изменились в другой вкладке. Повторите подключение.'
          : 'Не удалось записать настройки провайдера.',
        { keySaved: !useStoredKey });
    }

    state.balanceRef = '';
    state.balanceAt = 0;
    state.balance = null;
    state.costsKey = '';
    state.costsAt = 0;
    state.costs = null;
    state.sessionActualKey = '';
    state.sessionActualAt = 0;
    state.sessionActual = null;

    let balance = null;
    let balanceError = null;
    try {
      balance = await fetchBalance(key);
      state.balanceRef = ref;
      state.balanceAt = Date.now();
      state.balance = balance;
    } catch (error) {
      balanceError = error?.message || 'Не удалось получить баланс.';
    }

    send(res, 200, {
      ok: true,
      created: !openai,
      models: openaiValue.models.length,
      claudeModels: claudeValue?.models?.length || 0,
      apiKeyEnv: ref,
      baseURL: openaiValue.baseURL,
      balance,
      balanceError,
      keySaved: !useStoredKey,
      includeClaude,
    });
  }

  async function handler(req, res) {
    try {
      const connection = ctx.get('connection');
      if (connection) {
        const admission = connection.admit(req);
        if ('rejection' in admission) {
          return fail(res, admission.rejection, 'unauthorized', admission.rejection === 401
            ? 'Требуется вход в DSH.'
            : 'Запрос запрещён.');
        }
      }
      const pathname = new URL(req.url || '/', 'http://localhost').pathname;
      const subpath = pathname.startsWith(prefix) ? pathname.slice(prefix.length) : '';
      if (req.method === 'GET' && subpath === '/status') return await handleStatus(res);
      if (req.method === 'GET' && subpath === '/balance') return await handleBalance(res);
      if (req.method === 'GET' && subpath === '/costs') return await handleCosts(res);
      if (req.method === 'GET' && subpath === '/session-actual') return await handleSessionActual(req, res);
      if (req.method === 'POST' && subpath === '/connect') return await handleConnect(req, res);
      if (req.method === 'POST' && subpath === '/default-model') return await handleDefaultModel(req, res);
      return fail(res, 404, 'not-found', 'Not found');
    } catch (error) {
      console.error('[teamorouter] request failed:', error?.message || error);
      return fail(res, 500, 'internal', 'Внутренняя ошибка плагина.');
    }
  }

  ctx.effect(() => webServer.register({
    kind: 'prefix',
    path: prefix,
    handler,
  }), 'teamorouter: account routes');

  ctx.on('webserver/index-inject', (table) => {
    table.push({
      kind: 'global',
      name: '__TEAMOROUTER_ACCOUNT__',
      value: {
        base: prefix,
        dashboardURL: cfg.dashboardURL,
      },
    });
  });

  ctx.effect(() => {
    const timer = setInterval(() => {
      void fetchPricing();
    }, 5 * 60_000);
    timer.unref?.();
    return () => clearInterval(timer);
  }, 'teamorouter: pricing refresh');

  // A completed Turn is the point where billing has new records. Drop the
  // aggregate cache so the next settings poll or manual refresh reads fresh
  // numbers instead of waiting for the 60-second TTL.
  ctx.on('session/event', (_session, event) => {
    if (event?.type === 'turn/end') state.costsAt = 0;
  });

  const sessionProjections = ctx.get('sessionProjections');
  if (sessionProjections) {
    try {
      // Fold historical sessions only after the first price snapshot is known,
      // otherwise a cold restore would permanently mark older messages as
      // unpriced. The account routes above are already registered, so this
      // await does not delay the settings page.
      await fetchPricing();
      const handle = await sessionProjections.register(createCostProjection());
      ctx.effect(() => () => {
        Promise.resolve(handle.dispose()).catch(() => {});
      }, 'teamorouter: cost projection');
    } catch (error) {
      console.error('[teamorouter] cost projection failed:', error?.message || error);
    }
  }
}
