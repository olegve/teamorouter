window.__ModuleLoader__.load({
  id: '@local/dsh-teamorouter',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const NS = 'teamorouter-account';
    const NS_COST_PROJECTION = 'teamorouterCost';
    const DEFAULT_DASHBOARD = 'https://teamorouter.com/dashboard?buy=1';

    const LOGO_PATH = 'M5.338.294C2.347 1.101.255 3.266.017 5.78c-.11 1.193.33 2.055 1.32 2.642.661.386.9.422 2.294.33 1.67-.11 1.853-.054 2.184.588.183.348.146.66-.276 1.89-.44 1.284-.477 1.541-.275 2.183.532 1.78 3.064 2.202 4.312.716.77-.9.66-1.872-.459-4.257-1.027-2.147-1.266-3.284-.899-4.165.46-1.083 1.89-1.431 2.68-.642.642.642.513 1.192-.331 1.614-1.468.716-.55 1.578 1.303 1.23 1.798-.33 2.679-1.376 2.514-2.973C14.017 1.45 9.558-.844 5.338.294m2.256 2.77.771.771-.972 1.028L6.42 5.89l-.385-.605c-.202-.33-.606-.77-.918-1.01l-.55-.403.807-.752c.44-.404.863-.936.936-1.138.129-.404.129-.404.33-.037.11.202.55.716.954 1.12M4.567 7.139l-.642.679-.606-.66-.605-.661.605-.642.587-.66.643.641.642.624z';

    const ERROR_KEYS = {
      'missing-key': 'errMissingKey',
      'invalid-format': 'errInvalidFormat',
      'invalid-key': 'errInvalidKey',
      'no-models': 'errNoModels',
      'no-chat-models': 'errNoChatModels',
      'key-not-writable': 'errKeyNotWritable',
      'protocol-conflict': 'errProtocolConflict',
      'settings-write': 'errSettingsWrite',
      'settings-unavailable': 'errSettingsUnavailable',
      'rate-limit': 'errRateLimit',
      'upstream': 'errUpstream',
      'network': 'errNetwork',
      'insufficient-balance': 'errInsufficientBalance',
    };

    const EN = {
      nav: 'TeamoRouter',
      title: 'TeamoRouter',
      intro: 'Connect TeamoRouter with an API key. The plugin adds the provider, imports chat models, and shows the account balance.',
      loading: 'Loading…',
      noBridge: 'The account bridge is not available yet.',
      noBridgeHint: 'Reload the page after installing the plugin so the Host can inject the account bridge.',
      formTitle: 'Connect TeamoRouter',
      keyLabel: 'API key',
      keyPlaceholder: 'sk-teamo-...',
      keyHint: 'The key is stored on the Host and is never sent back to the browser.',
      show: 'Show',
      hide: 'Hide',
      connect: 'Connect',
      connecting: 'Connecting…',
      useStoredKey: 'Use saved key',
      includeClaude: 'Add Claude as a separate Anthropic route',
      includeClaudeHint: 'Claude works better through the Anthropic protocol; other models use OpenAI Chat Completions.',
      statusTitle: 'Connected',
      balance: 'Balance',
      balanceUnavailable: 'Balance is unavailable',
      refreshBalance: 'Refresh data',
      refreshModels: 'Refresh models',
      replaceKey: 'Replace key',
      cancel: 'Cancel',
      models: 'Models',
      claudeModels: 'Claude models',
      key: 'API key',
      saved: 'saved',
      notSaved: 'not saved',
      topUp: 'Top up',
      dashboard: 'TeamoRouter dashboard',
      updated: 'Updated',
      today: 'Today',
      month: 'This month',
      requests: 'requests',
      tokens: 'tokens',
      costsUnavailable: 'Costs are unavailable',
      sessionCost: 'TeamoRouter session cost',
      sessionCostHint: 'Estimated TeamoRouter cost for this session',
      messageCost: 'Request cost',
      turnCost: 'Turn cost',
      turnCostSuffix: 'per turn',
      requestsShort: 'req',
      costModel: 'Model',
      costInput: 'Input',
      costOutput: 'Output',
      costCacheRead: 'Cache read',
      costCacheWrite: 'Cache write',
      costNoPrice: 'No price for this model',
      costPartial: 'Some requests have no price yet',
      estimated: 'estimate',
      reconcile: 'Reconcile',
      reconcileTitle: 'Session cost reconciliation',
      reconcileHint: 'Compare the estimate with the billing API for this session period',
      estimatedCost: 'Estimated',
      actualCost: 'Actual for key period',
      actualRequests: 'Requests in billing',
      estimatedRequests: 'Estimated requests',
      actualRange: 'Period',
      difference: 'Difference',
      actualHint: 'Billing returns the total for the whole API key over the selected period. Other sessions, retries and failed calls may be included.',
      actualLoading: 'Loading billing data…',
      actualUnavailable: 'Billing data is unavailable',
      actualNoStart: 'Session start time is unavailable',
      refresh: 'Refresh',
      close: 'Close',
      modelsList: 'Models',
      defaultModel: 'Default model',
      makeDefault: 'Make default',
      defaultBadge: 'Default',
      defaultSet: 'Default model updated.',
      reasoning: 'reasoning',
      vision: 'vision',
      successConnected: 'TeamoRouter connected. Models were added to the model selector.',
      successUpdated: 'TeamoRouter settings updated.',
      successModels: 'Models refreshed.',
      successBalance: 'Data refreshed.',
      keyOnly: 'The key is saved, but the provider is not configured yet. Create it with the saved key or enter a new one.',
      notConfigured: 'Not connected yet.',
      retry: 'Retry',
      errMissingKey: 'Enter an API key.',
      errInvalidFormat: 'The key must start with sk-teamo- and contain no spaces.',
      errInvalidKey: 'The API key is invalid or revoked.',
      errNoModels: 'The key was accepted, but TeamoRouter returned no models.',
      errNoChatModels: 'No chat models suitable for DSH were found.',
      errKeyNotWritable: 'The key is supplied by the environment and cannot be overwritten.',
      errProtocolConflict: 'The existing teamorouter provider uses a different protocol.',
      errSettingsWrite: 'Could not save the provider settings. Refresh and retry.',
      errSettingsUnavailable: 'The llm-pi-ai settings are not available in this profile.',
      errRateLimit: 'TeamoRouter rate limit reached. Try again later.',
      errUpstream: 'TeamoRouter is temporarily unavailable.',
      errNetwork: 'Could not reach TeamoRouter.',
      errInsufficientBalance: 'The TeamoRouter balance is insufficient. Top up the account.',
      errGeneric: 'The operation failed. Try again.',
    };

    const RU = {
      nav: 'TeamoRouter',
      title: 'TeamoRouter',
      intro: 'Подключите TeamoRouter по API-ключу. Плагин добавит провайдера, импортирует чат-модели и покажет баланс аккаунта.',
      loading: 'Загрузка…',
      noBridge: 'Мост к аккаунту ещё недоступен.',
      noBridgeHint: 'Обновите страницу после установки плагина, чтобы Host внедрил мост аккаунта.',
      formTitle: 'Подключение TeamoRouter',
      keyLabel: 'API-ключ',
      keyPlaceholder: 'sk-teamo-...',
      keyHint: 'Ключ хранится на Host и не возвращается в браузер.',
      show: 'Показать',
      hide: 'Скрыть',
      connect: 'Подключить',
      connecting: 'Подключение…',
      useStoredKey: 'Использовать сохранённый ключ',
      includeClaude: 'Добавить Claude отдельным Anthropic-маршрутом',
      includeClaudeHint: 'Claude лучше работает через Anthropic-протокол; остальные модели — через OpenAI Chat Completions.',
      statusTitle: 'Подключено',
      balance: 'Баланс',
      balanceUnavailable: 'Баланс недоступен',
      refreshBalance: 'Обновить данные',
      refreshModels: 'Обновить модели',
      replaceKey: 'Заменить ключ',
      cancel: 'Отмена',
      models: 'Моделей',
      claudeModels: 'Claude-моделей',
      key: 'Ключ',
      saved: 'сохранён',
      notSaved: 'не сохранён',
      topUp: 'Пополнить',
      dashboard: 'Панель TeamoRouter',
      updated: 'Обновлено',
      today: 'Сегодня',
      month: 'Этот месяц',
      requests: 'запросов',
      tokens: 'токенов',
      costsUnavailable: 'Затраты недоступны',
      sessionCost: 'Стоимость сессии TeamoRouter',
      sessionCostHint: 'Оценка стоимости TeamoRouter за текущую сессию',
      messageCost: 'Стоимость запроса',
      turnCost: 'Стоимость хода',
      turnCostSuffix: 'за ход',
      requestsShort: 'зап.',
      costModel: 'Модель',
      costInput: 'Ввод',
      costOutput: 'Вывод',
      costCacheRead: 'Чтение кэша',
      costCacheWrite: 'Запись кэша',
      costNoPrice: 'Нет цены для этой модели',
      costPartial: 'Часть запросов пока без цены',
      estimated: 'оценка',
      reconcile: 'Сверить',
      reconcileTitle: 'Сверка стоимости сессии',
      reconcileHint: 'Сравнить оценку с billing API за период сессии',
      estimatedCost: 'Оценка',
      actualCost: 'Факт по ключу за период',
      actualRequests: 'Запросов в billing',
      estimatedRequests: 'Запросов в оценке',
      actualRange: 'Период',
      difference: 'Разница',
      actualHint: 'Billing возвращает сумму по всему API-ключу за выбранный период. В неё могут попасть другие сессии, повторы и неудачные запросы.',
      actualLoading: 'Загружаю данные billing…',
      actualUnavailable: 'Данные billing недоступны',
      actualNoStart: 'Время начала сессии неизвестно',
      refresh: 'Обновить',
      close: 'Закрыть',
      modelsList: 'Модели',
      defaultModel: 'Модель по умолчанию',
      makeDefault: 'Сделать основной',
      defaultBadge: 'Основная',
      defaultSet: 'Модель по умолчанию обновлена.',
      reasoning: 'рассуждения',
      vision: 'изображения',
      successConnected: 'TeamoRouter подключён. Модели добавлены в селектор.',
      successUpdated: 'Настройки TeamoRouter обновлены.',
      successModels: 'Модели обновлены.',
      successBalance: 'Данные обновлены.',
      keyOnly: 'Ключ сохранён, но провайдер ещё не создан. Создайте его сохранённым ключом или введите новый.',
      notConfigured: 'Ещё не подключено.',
      retry: 'Повторить',
      errMissingKey: 'Введите API-ключ.',
      errInvalidFormat: 'Ключ должен начинаться с sk-teamo- и не содержать пробелов.',
      errInvalidKey: 'Ключ неверный или отозван.',
      errNoModels: 'Ключ принят, но TeamoRouter не вернул моделей.',
      errNoChatModels: 'В каталоге не нашлось чат-моделей для DSH.',
      errKeyNotWritable: 'Ключ задаётся окружением и не может быть перезаписан.',
      errProtocolConflict: 'Существующий провайдер teamorouter использует другой протокол.',
      errSettingsWrite: 'Не удалось сохранить настройки провайдера. Обновите страницу и повторите.',
      errSettingsUnavailable: 'Настройки llm-pi-ai недоступны в этом профиле.',
      errRateLimit: 'TeamoRouter ограничил частоту запросов. Попробуйте позже.',
      errUpstream: 'TeamoRouter временно недоступен.',
      errNetwork: 'Не удалось связаться с TeamoRouter.',
      errInsufficientBalance: 'Баланс TeamoRouter исчерпан. Пополните счёт.',
      errGeneric: 'Операция не удалась. Попробуйте ещё раз.',
    };

    const S = {
      page: { maxWidth: 720, display: 'flex', flexDirection: 'column', gap: 12, color: 'var(--dsw-alias-label-primary)' },
      title: { margin: 0, fontSize: 16, fontWeight: 500, lineHeight: '24px' },
      intro: { margin: 0, fontSize: 14, lineHeight: '22px', color: 'var(--dsw-alias-label-tertiary)' },
      card: {
        display: 'flex', flexDirection: 'column', gap: 12, padding: '14px 16px',
        border: '0.5px solid var(--dsw-alias-settings-card-stroke)',
        background: 'var(--dsw-alias-settings-card-fill)',
        borderRadius: 'var(--dsw-radius-xl)',
      },
      cardTitle: { fontSize: 14, fontWeight: 500, lineHeight: '22px' },
      field: { display: 'flex', flexDirection: 'column', gap: 6 },
      label: { fontSize: 12, fontWeight: 500, lineHeight: '18px', color: 'var(--dsw-alias-label-secondary)' },
      inputRow: { display: 'flex', gap: 8 },
      input: {
        flex: 1, minWidth: 0, height: 32, boxSizing: 'border-box',
        border: '0.5px solid var(--dsw-alias-border-l4)',
        borderRadius: 'var(--dsw-radius-md)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        padding: '0 10px', font: 'inherit', fontSize: 14,
      },
      eye: {
        height: 32, padding: '0 12px',
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-md)',
        background: 'transparent', color: 'var(--dsw-alias-label-secondary)',
        cursor: 'pointer', font: 'inherit', fontSize: 12,
      },
      hint: { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' },
      checkRow: {
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, lineHeight: '20px', color: 'var(--dsw-alias-label-primary)',
      },
      actions: { display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 2 },
      primary: {
        height: 36, padding: '0 14px', border: 'none',
        borderRadius: 'var(--dsw-radius-md)',
        background: 'var(--dsw-alias-button-primary-fill)',
        color: 'var(--dsw-alias-label-primary-foreground)',
        font: 'inherit', fontSize: 14, cursor: 'pointer',
      },
      secondary: {
        height: 32, padding: '0 12px',
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-md)',
        background: 'transparent', color: 'var(--dsw-alias-label-primary)',
        font: 'inherit', fontSize: 13, cursor: 'pointer',
      },
      error: { fontSize: 13, lineHeight: '20px', color: 'var(--dsw-alias-state-error-primary)' },
      warn: { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-warn-label)' },
      notice: { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-state-success-primary)' },
      statusHead: { display: 'flex', alignItems: 'center', gap: 8 },
      dot: {
        width: 8, height: 8, borderRadius: '50%',
        background: 'var(--dsw-alias-state-success-primary)',
        display: 'inline-block',
      },
      statusTitle: { fontSize: 14, fontWeight: 500 },
      badge: {
        fontSize: 11, lineHeight: '16px', padding: '1px 6px',
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-xs)',
        color: 'var(--dsw-alias-label-secondary)',
      },
      balanceRow: { display: 'flex', alignItems: 'baseline', gap: 10 },
      balanceLabel: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
      balanceValue: { fontSize: 24, fontWeight: 500, lineHeight: '32px' },
      metaRow: {
        display: 'flex', flexWrap: 'wrap', gap: 16,
        fontSize: 12, color: 'var(--dsw-alias-label-secondary)',
      },
      links: { display: 'flex', gap: 16, fontSize: 13 },
      link: { color: 'var(--dsw-alias-state-business-primary)', textDecoration: 'none' },
      costGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: 8 },
      costCell: {
        display: 'flex', flexDirection: 'column', gap: 4,
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-lg)', padding: '10px 12px',
      },
      costLabel: { fontSize: 12, color: 'var(--dsw-alias-label-tertiary)' },
      costValue: { fontSize: 20, fontWeight: 500, lineHeight: '28px' },
      costMeta: { fontSize: 12, color: 'var(--dsw-alias-label-secondary)' },
      details: { borderTop: '0.5px solid var(--dsw-alias-border-l2)', paddingTop: 10 },
      summary: {
        cursor: 'pointer', fontSize: 12, fontWeight: 500,
        color: 'var(--dsw-alias-label-secondary)',
      },
      modelList: {
        display: 'flex', flexDirection: 'column', gap: 4,
        maxHeight: 240, overflowY: 'auto', marginTop: 8,
      },
      modelRow: {
        display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
        fontSize: 12, color: 'var(--dsw-alias-label-secondary)',
        padding: '4px 0', borderBottom: '0.5px solid var(--dsw-alias-border-l4)',
      },
      modelName: { color: 'var(--dsw-alias-label-primary)', fontSize: 12, fontWeight: 500 },
      modelId: {
        fontFamily: 'var(--ds-font-family-code)', fontSize: 11,
        color: 'var(--dsw-alias-label-tertiary)',
      },
      modelBadge: {
        fontSize: 10, lineHeight: '14px', padding: '0 5px',
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-xs)',
      },
      modelMeta: { fontSize: 10, color: 'var(--dsw-alias-label-tertiary)' },
      modelButton: {
        fontSize: 10, lineHeight: '14px', padding: '0 5px',
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-xs)', background: 'transparent',
        color: 'var(--dsw-alias-state-business-primary)', cursor: 'pointer',
        font: 'inherit',
      },
      defaultBadge: {
        fontSize: 10, lineHeight: '14px', padding: '0 5px',
        border: '0.5px solid var(--dsw-alias-state-success-primary)',
        borderRadius: 'var(--dsw-radius-xs)',
        color: 'var(--dsw-alias-state-success-primary)',
      },
      providerStrip: {
        display: 'flex', flexWrap: 'wrap', alignItems: 'baseline', gap: 8,
        borderTop: '0.5px solid var(--dsw-alias-border-l2)',
        paddingTop: 8, marginTop: 2, fontSize: 12,
        color: 'var(--dsw-alias-label-secondary)',
      },
      providerValue: { color: 'var(--dsw-alias-label-primary)', fontWeight: 500 },
      providerButton: {
        fontSize: 11, lineHeight: '16px', padding: '0 6px',
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-xs)', background: 'transparent',
        color: 'var(--dsw-alias-label-secondary)', cursor: 'pointer', font: 'inherit',
      },
      costAnchor: {
        minWidth: 0,
        fontSize: 'calc(var(--dsh-content-font-size-secondary, 13px) - 1px)',
        lineHeight: 'calc(20px + var(--dsh-content-font-delta-secondary, 0px))',
        display: 'inline-flex',
      },
      costPill: {
        boxSizing: 'border-box',
        borderRadius: 'var(--dsw-radius-sm)',
        maxWidth: '100%',
        color: 'var(--dsw-alias-label-tertiary)',
        font: 'inherit',
        fontVariantNumeric: 'tabular-nums',
        lineHeight: 'inherit',
        whiteSpace: 'nowrap',
        background: 'transparent',
        border: 'none',
        alignItems: 'center',
        gap: 6,
        padding: '1px 8px',
        display: 'inline-flex',
      },
      costLabel: {
        textOverflow: 'ellipsis',
        minWidth: 0,
        overflow: 'hidden',
      },
      dialog: {
        width: 'min(460px, calc(100vw - 32px))',
        maxWidth: 'calc(100vw - 32px)',
        padding: 0,
        border: '0.5px solid var(--dsw-alias-border-l3)',
        borderRadius: 'var(--dsw-radius-xl)',
        background: 'var(--dsw-alias-bg-layer-1)',
        color: 'var(--dsw-alias-label-primary)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.28)',
        overflow: 'hidden',
      },
      dialogHead: {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: 12, padding: '14px 16px',
        borderBottom: '0.5px solid var(--dsw-alias-border-l2)',
      },
      dialogTitle: { fontSize: 14, fontWeight: 500, lineHeight: '22px' },
      dialogClose: {
        border: 'none', background: 'transparent', color: 'var(--dsw-alias-label-tertiary)',
        cursor: 'pointer', font: 'inherit', fontSize: 18, lineHeight: '20px', padding: '0 4px',
      },
      dialogBody: {
        display: 'flex', flexDirection: 'column', gap: 10, padding: '14px 16px',
      },
      dialogRow: {
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        gap: 12, fontSize: 13, lineHeight: '20px',
      },
      dialogLabel: { color: 'var(--dsw-alias-label-tertiary)' },
      dialogValue: {
        color: 'var(--dsw-alias-label-primary)', fontWeight: 500,
        fontVariantNumeric: 'tabular-nums',
      },
      dialogRule: { height: 1, background: 'var(--dsw-alias-border-l2)', margin: '2px 0' },
      dialogHint: { fontSize: 12, lineHeight: '18px', color: 'var(--dsw-alias-label-tertiary)' },
      dialogError: {
        fontSize: 12, lineHeight: '18px',
        color: 'var(--dsw-alias-state-error-primary)',
      },
      dialogActions: {
        display: 'flex', justifyContent: 'flex-end', gap: 8,
        padding: '12px 16px', borderTop: '0.5px solid var(--dsw-alias-border-l2)',
      },
      messageCost: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        height: 24,
        padding: '0 6px',
        borderRadius: 'var(--dsw-radius-sm)',
        color: 'var(--dsw-alias-label-tertiary)',
        font: 'inherit',
        fontSize: 12,
        fontVariantNumeric: 'tabular-nums',
        whiteSpace: 'nowrap',
        lineHeight: '24px',
      },
      turnCost: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '2px 0',
        color: 'var(--dsw-alias-label-tertiary)',
        fontSize: 12,
        lineHeight: '18px',
        fontVariantNumeric: 'tabular-nums',
      },
      turnCostMeta: {
        color: 'var(--dsw-alias-label-secondary)',
      },
    };

    function AccountIcon({ size = 18, active = false }) {
      return h('svg', {
        width: size, height: size, viewBox: '0 0 15 16', fill: 'none',
        'aria-hidden': true, style: { display: 'block', opacity: active ? 1 : 0.75 },
      },
        h('path', { d: LOGO_PATH, fill: 'currentColor' }),
      );
    }

    function money(balance) {
      if (!balance) return '—';
      const amount = Number(balance.value);
      if (!Number.isFinite(amount)) return `${balance.value} ${balance.currency || 'USD'}`;
      if (amount > 0 && amount < 0.01) return '< $0.01';
      try {
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: balance.currency || 'USD',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(amount);
      } catch {
        return `${amount.toFixed(2)} ${balance.currency || 'USD'}`;
      }
    }

    function formatCost(value) {
      if (!Number.isFinite(value)) return '—';
      if (value > 0 && value < 0.0001) return '< $0.0001';
      if (value >= 1) return `$${value.toFixed(2)}`;
      return `$${value.toFixed(4)}`;
    }

    function costChipText(view) {
      const session = view?.session;
      if (!session || !Number.isFinite(session.requests) || session.requests <= 0) return null;
      if (session.unpriced >= session.requests) return '—';
      return `≈ ${formatCost(session.cost)}${session.unpriced > 0 ? '*' : ''}`;
    }

    function messageCostChip(view, messageId, t) {
      const message = view?.messages?.[messageId];
      if (!message) return null;
      const text = message.cost === null ? '—' : `≈ ${formatCost(message.cost)}`;
      const usage = message.usage || {};
      const title = [
        `${t('messageCost')}: ${text} (${t('estimated')})`,
        `${t('costModel')}: ${message.model || '—'}`,
        `${t('costInput')}: ${formatTokens(usage.inputTokens)}`,
        `${t('costOutput')}: ${formatTokens(usage.outputTokens)}`,
        usage.cacheReadTokens ? `${t('costCacheRead')}: ${formatTokens(usage.cacheReadTokens)}` : null,
        usage.cacheWriteTokens ? `${t('costCacheWrite')}: ${formatTokens(usage.cacheWriteTokens)}` : null,
        message.cost === null ? t('costNoPrice') : null,
      ].filter(Boolean).join('\n');
      return { text, title };
    }

    function turnCostChip(view, turn, t) {
      const bucket = view?.turns?.[String(turn)];
      if (!bucket || !Number.isFinite(bucket.requests) || bucket.requests <= 0) return null;
      const amount = bucket.unpriced >= bucket.requests
        ? '—'
        : `≈ ${formatCost(bucket.cost)}${bucket.unpriced > 0 ? '*' : ''}`;
      const title = [
        `${t('turnCost')}: ${amount} (${t('estimated')})`,
        `${t('requests')}: ${bucket.requests}`,
        `${t('tokens')}: ${formatTokens(bucket.tokens)}`,
        bucket.unpriced > 0 ? `${t('costPartial')}: ${bucket.unpriced}` : null,
        bucket.unpriced >= bucket.requests ? t('costNoPrice') : null,
      ].filter(Boolean).join('\n');
      return { text: `${amount} ${t('turnCostSuffix')} · ${bucket.requests} ${t('requestsShort')}`, title };
    }

    function formatTokens(value) {
      if (!Number.isFinite(value)) return '';
      if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(value % 1_000_000 === 0 ? 0 : 1)}M`;
      if (value >= 1_000) return `${Math.round(value / 1_000)}K`;
      return String(value);
    }

    function timeLabel(value) {
      if (!value) return '';
      try {
        return new Date(value).toLocaleTimeString();
      } catch {
        return '';
      }
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, { en: EN, ru: RU }), 'teamorouter: dictionaries');
        const t = ctx.locale.bind(NS);

        function errorText(error) {
          const key = ERROR_KEYS[error?.code] || 'errGeneric';
          const text = t(key);
          return text === key ? (error?.message || t('errGeneric')) : text;
        }

        function ProviderBalance({ provider, keyConfigured }) {
          const providerId = String(
            provider?.provider
              || provider?.id
              || provider?.settingsPath?.[1]
              || '',
          );
          const isTeamorouter = providerId === 'teamorouter' || providerId === 'teamorouter-anthropic';
          const base = typeof globalThis.__TEAMOROUTER_ACCOUNT__?.base === 'string'
            ? globalThis.__TEAMOROUTER_ACCOUNT__.base
            : '';
          const dashboard = globalThis.__TEAMOROUTER_ACCOUNT__?.dashboardURL || DEFAULT_DASHBOARD;
          const [balance, setBalance] = React.useState(null);
          const [costs, setCosts] = React.useState(null);
          const [busy, setBusy] = React.useState(false);

          async function load() {
            if (!isTeamorouter || !keyConfigured || !base) return;
            setBusy(true);
            try {
              const [balanceResponse, costsResponse] = await Promise.all([
                fetch(base + '/balance', { credentials: 'same-origin' }),
                fetch(base + '/costs', { credentials: 'same-origin' }),
              ]);
              const balanceData = await balanceResponse.json().catch(() => null);
              const costsData = await costsResponse.json().catch(() => null);
              if (balanceData?.ok) setBalance(balanceData.balance);
              if (costsData?.ok) setCosts(costsData);
            } catch {
              // The account page owns the detailed error states.
            } finally {
              setBusy(false);
            }
          }

          React.useEffect(() => {
            load();
          }, [base, keyConfigured, providerId]);

          if (!isTeamorouter || !keyConfigured || !base) return null;

          return h('div', { style: S.providerStrip },
            h('span', {}, t('balance')),
            h('span', { style: S.providerValue }, busy ? '…' : money(balance)),
            h('span', {}, '·'),
            h('span', {}, `${t('today')}: ${busy ? '…' : money(costs?.today?.amount)}`),
            h('span', {}, '·'),
            h('span', {}, `${t('month')}: ${busy ? '…' : money(costs?.month?.amount)}`),
            h('button', {
              type: 'button', style: S.providerButton, disabled: busy,
              onClick: load,
            }, t('refreshBalance')),
            h('a', {
              href: dashboard, target: '_blank', rel: 'noopener noreferrer', style: S.link,
            }, t('topUp')),
          );
        }

        function useLocaleRefresh() {
          const [, setTick] = React.useState(0);
          React.useEffect(() => ctx.locale.subscribe(() => setTick((value) => value + 1)), []);
        }

        function CostPill({ useProjection }) {
          useLocaleRefresh();
          const view = useProjection(NS_COST_PROJECTION);
          const text = costChipText(view);
          const [open, setOpen] = React.useState(false);
          const [actual, setActual] = React.useState(null);
          const [actualState, setActualState] = React.useState('idle');
          const [actualError, setActualError] = React.useState('');
          const dialogRef = React.useRef(null);
          const requestSeq = React.useRef(0);
          const titleId = React.useId();
          const base = typeof globalThis.__TEAMOROUTER_ACCOUNT__?.base === 'string'
            ? globalThis.__TEAMOROUTER_ACCOUNT__.base
            : '';

          React.useEffect(() => {
            const dialog = dialogRef.current;
            if (!dialog) return;
            if (open && !dialog.open) {
              try {
                dialog.showModal();
              } catch {
                // A second click while the dialog is opening is harmless.
              }
            } else if (!open && dialog.open) {
              dialog.close();
            }
          }, [open]);

          React.useEffect(() => () => {
            requestSeq.current += 1;
          }, []);

          async function loadActual() {
            const session = view?.session;
            if (!base) {
              setActualState('error');
              setActualError(t('actualUnavailable'));
              return;
            }
            if (!session || !Number.isFinite(session.startedAt)) {
              setActualState('error');
              setActualError(t('actualNoStart'));
              return;
            }
            const start = Math.floor(session.startedAt / 1000);
            const end = Math.ceil(Date.now() / 1000);
            if (end <= start) {
              setActualState('error');
              setActualError(t('actualUnavailable'));
              return;
            }
            const seq = requestSeq.current + 1;
            requestSeq.current = seq;
            setActualState('loading');
            setActualError('');
            try {
              const response = await fetch(
                `${base}/session-actual?start=${start}&end=${end}`,
                { credentials: 'same-origin' },
              );
              const data = await response.json().catch(() => null);
              if (seq !== requestSeq.current) return;
              if (!response.ok || data?.ok === false) {
                setActualState('error');
                setActualError(data?.error ? errorText(data.error) : t('actualUnavailable'));
                return;
              }
              setActual(data);
              setActualState('ready');
            } catch {
              if (seq !== requestSeq.current) return;
              setActualState('error');
              setActualError(t('actualUnavailable'));
            }
          }

          function openReconcile() {
            setOpen(true);
            void loadActual();
          }

          if (!text) return null;
          const session = view.session;
          const title = [
            `${t('sessionCost')}: ${text} (${t('estimated')})`,
            `${t('requests')}: ${session.requests}`,
            `${t('tokens')}: ${formatTokens(session.tokens)}`,
            session.unpriced > 0 ? `${t('costPartial')}: ${session.unpriced}` : null,
            session.unpriced >= session.requests ? t('costNoPrice') : null,
            t('reconcileHint'),
          ].filter(Boolean).join('\n');

          const actualAmount = actual ? Number(actual.amount?.value) : NaN;
          const canCompare = session.unpriced < session.requests;
          const delta = canCompare && Number.isFinite(actualAmount)
            ? actualAmount - session.cost
            : null;
          const deltaText = delta === null
            ? '—'
            : `${delta >= 0 ? '+' : '−'}${formatCost(Math.abs(delta))}`;
          const percent = delta !== null && session.cost > 0
            ? `${delta >= 0 ? '+' : ''}${(delta / session.cost * 100).toFixed(1)}%`
            : null;
          const actualRequests = actual ? Number(actual.requests) : NaN;
          const requestsDiffer = Number.isFinite(actualRequests) && actualRequests !== session.requests;
          const periodLabel = Number.isFinite(session.startedAt)
            ? `${new Date(session.startedAt).toLocaleString()} — ${new Date((actual?.end ?? Math.ceil(Date.now() / 1000)) * 1000).toLocaleString()}`
            : '—';

          const row = (label, value, key) => h('div', { key, style: S.dialogRow },
            h('span', { style: S.dialogLabel }, label),
            h('span', { style: S.dialogValue }, value),
          );

          const actualRows = actualState === 'loading'
            ? [h('div', { key: 'loading', style: S.dialogHint }, t('actualLoading'))]
            : actualState === 'error'
              ? [h('div', { key: 'error', style: S.dialogError, role: 'alert' }, actualError || t('actualUnavailable'))]
              : actual
                ? [
                    row(t('actualCost'), formatCost(actualAmount), 'actual-cost'),
                    row(t('actualRequests'), String(actualRequests), 'actual-requests'),
                    requestsDiffer
                      ? h('div', { key: 'requests-diff', style: S.dialogHint },
                          `${t('estimatedRequests')}: ${session.requests} · ${t('actualRequests')}: ${actualRequests}`)
                      : null,
                    row(t('difference'), percent === null ? deltaText : `${deltaText} (${percent})`, 'difference'),
                    h('div', { key: 'hint', style: S.dialogHint }, t('actualHint')),
                  ].filter(Boolean)
                : [h('div', { key: 'idle', style: S.dialogHint }, t('actualHint'))];

          return h(React.Fragment, null,
            h('button', {
              type: 'button',
              style: { ...S.costAnchor, ...S.costPill, cursor: 'pointer', appearance: 'none' },
              title,
              'aria-label': title,
              'aria-haspopup': 'dialog',
              'data-composer-stat': 'teamorouter-cost',
              onClick: openReconcile,
            },
              h(AccountIcon, { size: 14 }),
              h('span', { style: S.costLabel }, text),
            ),
            h('dialog', {
              ref: dialogRef,
              className: 'teamorouter-dialog',
              style: S.dialog,
              'aria-labelledby': titleId,
              onClose: () => setOpen(false),
            },
              h('div', { style: S.dialogHead },
                h('div', { id: titleId, style: S.dialogTitle }, t('reconcileTitle')),
                h('button', {
                  type: 'button',
                  style: S.dialogClose,
                  'aria-label': t('close'),
                  onClick: () => setOpen(false),
                }, '×'),
              ),
              h('div', { style: S.dialogBody },
                row(t('estimatedCost'), text),
                row(t('estimatedRequests'), String(session.requests)),
                row(t('actualRange'), periodLabel),
                h('div', { style: S.dialogRule }),
                ...actualRows,
              ),
              h('div', { style: S.dialogActions },
                h('button', {
                  type: 'button',
                  style: S.secondary,
                  disabled: actualState === 'loading',
                  onClick: () => void loadActual(),
                }, t('refresh')),
                h('button', {
                  type: 'button',
                  style: S.secondary,
                  onClick: () => setOpen(false),
                }, t('close')),
              ),
            ),
          );
        }

        function MessageCost({ useProjection, messageId }) {
          useLocaleRefresh();
          const view = useProjection(NS_COST_PROJECTION);
          const chip = messageCostChip(view, messageId, t);
          if (!chip) return null;
          return h('span', {
            style: S.messageCost,
            title: chip.title,
            'aria-label': chip.title,
            'data-teamorouter-message-cost': messageId,
          },
            h(AccountIcon, { size: 12 }),
            h('span', {}, chip.text),
          );
        }

        function TurnCost({ useProjection, turn }) {
          useLocaleRefresh();
          const view = useProjection(NS_COST_PROJECTION);
          const chip = turnCostChip(view, turn, t);
          if (!chip) return null;
          return h('div', {
            style: S.turnCost,
            title: chip.title,
            'aria-label': chip.title,
            'data-teamorouter-turn-cost': String(turn),
          },
            h(AccountIcon, { size: 12 }),
            h('span', {}, chip.text),
            h('span', { style: S.turnCostMeta }, `· ${t('tokens')}: ${formatTokens(view.turns[String(turn)].tokens)}`),
          );
        }

        function AccountPage() {
          const [, setLocaleTick] = React.useState(0);
          const [base, setBase] = React.useState(
            typeof globalThis.__TEAMOROUTER_ACCOUNT__?.base === 'string'
              ? globalThis.__TEAMOROUTER_ACCOUNT__.base
              : '',
          );
          const [status, setStatus] = React.useState(null);
          const [loading, setLoading] = React.useState(true);
          const [busy, setBusy] = React.useState(false);
          const [error, setError] = React.useState('');
          const [notice, setNotice] = React.useState('');
          const [key, setKey] = React.useState('');
          const [showKey, setShowKey] = React.useState(false);
          const [includeClaude, setIncludeClaude] = React.useState(true);
          const [editingKey, setEditingKey] = React.useState(false);
          const [costs, setCosts] = React.useState(null);
          const [costsLoading, setCostsLoading] = React.useState(false);
          const [costsError, setCostsError] = React.useState('');

          React.useEffect(() => ctx.locale.subscribe(() => setLocaleTick((value) => value + 1)), [ctx]);
          React.useEffect(() => {
            if (base) return;
            const timer = setInterval(() => {
              const next = globalThis.__TEAMOROUTER_ACCOUNT__?.base;
              if (typeof next === 'string' && next.length > 0) {
                setBase(next);
                clearInterval(timer);
              }
            }, 1000);
            return () => clearInterval(timer);
          }, [base]);

          async function call(path, options = {}) {
            let response;
            try {
              response = await fetch(base + path, { credentials: 'same-origin', ...options });
            } catch {
              const failure = new Error('network');
              failure.code = 'network';
              throw failure;
            }
            let data = null;
            try {
              data = await response.json();
            } catch {
              data = null;
            }
            if (!response.ok || data?.ok === false) {
              const failure = new Error(data?.error?.message || `HTTP ${response.status}`);
              failure.code = data?.error?.code || 'network';
              failure.status = response.status;
              throw failure;
            }
            return data;
          }

          async function refreshStatus(silent = false) {
            if (!base) {
              setLoading(false);
              return;
            }
            if (!silent) setLoading(true);
            try {
              const data = await call('/status');
              setStatus(data);
              setError('');
              if (data.keyConfigured) refreshCosts(true);
            } catch (failure) {
              setError(errorText(failure));
            } finally {
              if (!silent) setLoading(false);
            }
          }

          async function refreshCosts(silent = false) {
            if (!base) return;
            if (!silent) setCostsLoading(true);
            try {
              const data = await call('/costs');
              setCosts(data);
              setCostsError('');
            } catch (failure) {
              setCostsError(errorText(failure));
            } finally {
              if (!silent) setCostsLoading(false);
            }
          }

          React.useEffect(() => {
            refreshStatus();
          }, [base]);

          React.useEffect(() => {
            if (!status?.keyConfigured) return undefined;
            const timer = setInterval(() => {
              void refreshCosts(true);
            }, 60_000);
            return () => clearInterval(timer);
          }, [base, status?.keyConfigured]);

          async function connect(useStoredKey) {
            if (!base) return;
            setBusy(true);
            setError('');
            setNotice('');
            try {
              const payload = useStoredKey
                ? { useStoredKey: true, includeClaude }
                : { apiKey: key, includeClaude };
              const data = await call('/connect', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify(payload),
              });
              setKey('');
              setEditingKey(false);
              setNotice(data.created ? t('successConnected') : t('successUpdated'));
              await refreshStatus(true);
            } catch (failure) {
              setError(errorText(failure));
            } finally {
              setBusy(false);
            }
          }

          async function refreshBalance() {
            if (!base) return;
            setBusy(true);
            setError('');
            setNotice('');
            try {
              const [balanceResult, costsResult] = await Promise.allSettled([
                call('/balance'),
                call('/costs'),
              ]);
              if (costsResult.status === 'fulfilled') {
                setCosts(costsResult.value);
                setCostsError('');
              } else {
                setCostsError(errorText(costsResult.reason));
              }
              if (balanceResult.status === 'rejected') throw balanceResult.reason;
              const data = balanceResult.value;
              setStatus((current) => current === null ? current : {
                ...current,
                balance: data.balance,
                balanceError: null,
                balanceUpdatedAt: data.updatedAt,
              });
              setNotice(t('successBalance'));
            } catch (failure) {
              setError(errorText(failure));
            } finally {
              setBusy(false);
            }
          }

          async function refreshModels() {
            if (!base) return;
            setBusy(true);
            setError('');
            setNotice('');
            try {
              await call('/connect', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ useStoredKey: true, includeClaude }),
              });
              setNotice(t('successModels'));
              await refreshStatus(true);
            } catch (failure) {
              setError(errorText(failure));
            } finally {
              setBusy(false);
            }
          }

          async function makeDefault(model) {
            if (!base || busy) return;
            setBusy(true);
            setError('');
            setNotice('');
            try {
              await call('/default-model', {
                method: 'POST',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ provider: model.provider, model: model.id }),
              });
              setNotice(t('defaultSet'));
              await refreshStatus(true);
            } catch (failure) {
              setError(errorText(failure));
            } finally {
              setBusy(false);
            }
          }

          const connected = status?.configured === true;
          const keyReady = status?.keyConfigured === true;
          const showForm = !connected || editingKey;
          const dashboard = status?.dashboardURL || DEFAULT_DASHBOARD;
          const modelList = Array.isArray(status?.modelList) ? status.modelList : [];

          const header = [
            h('h1', { key: 'title', style: S.title }, t('title')),
            h('p', { key: 'intro', style: S.intro }, t('intro')),
          ];

          if (!base) {
            return h('section', { style: S.page },
              ...header,
              h('div', { style: S.card },
                h('div', { style: S.cardTitle }, t('noBridge')),
                h('div', { style: S.hint }, t('noBridgeHint')),
              ),
            );
          }

          if (loading) {
            return h('section', { style: S.page },
              ...header,
              h('p', { style: S.hint, role: 'status' }, t('loading')),
            );
          }

          if (status === null) {
            return h('section', { style: S.page },
              ...header,
              error ? h('div', { style: S.error, role: 'alert' }, error) : null,
              h('div', { style: S.actions },
                h('button', {
                  type: 'button', style: S.secondary, onClick: () => refreshStatus(),
                }, t('retry')),
              ),
            );
          }

          const form = showForm ? h('div', { key: 'form', style: S.card },
            h('div', { style: S.cardTitle }, t('formTitle')),
            !connected && keyReady
              ? h('div', { style: S.hint }, t('keyOnly'))
              : null,
            h('div', { style: S.field },
              h('label', { style: S.label, htmlFor: 'teamorouter-key' }, t('keyLabel')),
              h('div', { style: S.inputRow },
                h('input', {
                  id: 'teamorouter-key',
                  type: showKey ? 'text' : 'password',
                  value: key,
                  placeholder: t('keyPlaceholder'),
                  autoComplete: 'new-password',
                  spellCheck: false,
                  disabled: busy,
                  style: S.input,
                  onChange: (event) => setKey(event.target.value),
                  onKeyDown: (event) => {
                    if (event.key === 'Enter' && !busy) connect(false);
                  },
                }),
                h('button', {
                  type: 'button',
                  style: S.eye,
                  disabled: busy,
                  'aria-label': showKey ? t('hide') : t('show'),
                  onClick: () => setShowKey((value) => !value),
                }, showKey ? t('hide') : t('show')),
              ),
              h('div', { style: S.hint }, t('keyHint')),
            ),
            h('label', { style: S.checkRow },
              h('input', {
                type: 'checkbox',
                checked: includeClaude,
                disabled: busy,
                onChange: (event) => setIncludeClaude(event.target.checked),
              }),
              h('span', {}, t('includeClaude')),
            ),
            h('div', { style: S.hint }, t('includeClaudeHint')),
            h('div', { style: S.actions },
              h('button', {
                type: 'button',
                style: { ...S.primary, opacity: busy ? 0.5 : 1 },
                disabled: busy,
                onClick: () => connect(false),
              }, busy ? t('connecting') : t('connect')),
              !connected && keyReady
                ? h('button', {
                    type: 'button', style: S.secondary, disabled: busy,
                    onClick: () => connect(true),
                  }, t('useStoredKey'))
                : null,
              connected && editingKey
                ? h('button', {
                    type: 'button', style: S.secondary, disabled: busy,
                    onClick: () => {
                      setEditingKey(false);
                      setKey('');
                    },
                  }, t('cancel'))
                : null,
            ),
          ) : null;

          const statusCard = connected && !editingKey ? h('div', { key: 'status', style: S.card },
            h('div', { style: S.statusHead },
              h('span', { style: S.dot }),
              h('span', { style: S.statusTitle }, t('statusTitle')),
              h('span', { style: S.badge }, status.providerId || 'teamorouter'),
            ),
            h('div', { style: S.balanceRow },
              h('span', { style: S.balanceLabel }, t('balance')),
              h('span', { style: S.balanceValue }, money(status.balance)),
            ),
            status.balanceError
              ? h('div', { style: S.warn, role: 'status' }, `${t('balanceUnavailable')}: ${status.balanceError}`)
              : null,
            status.balanceUpdatedAt
              ? h('div', { style: S.hint }, `${t('updated')}: ${timeLabel(status.balanceUpdatedAt)}`)
              : null,
            h('div', { style: S.costGrid },
              h('div', { style: S.costCell },
                h('div', { style: S.costLabel }, t('today')),
                h('div', { style: S.costValue }, costsLoading ? '…' : money(costs?.today?.amount)),
                h('div', { style: S.costMeta }, costs?.today
                  ? `${costs.today.requests || 0} ${t('requests')}${Number.isFinite(costs.today.tokens) ? ` · ${formatTokens(costs.today.tokens)} ${t('tokens')}` : ''}`
                  : (costsError ? t('costsUnavailable') : '—')),
              ),
              h('div', { style: S.costCell },
                h('div', { style: S.costLabel }, t('month')),
                h('div', { style: S.costValue }, costsLoading ? '…' : money(costs?.month?.amount)),
                h('div', { style: S.costMeta }, costs?.month
                  ? `${costs.month.requests || 0} ${t('requests')}${Number.isFinite(costs.month.tokens) ? ` · ${formatTokens(costs.month.tokens)} ${t('tokens')}` : ''}`
                  : (costsError ? t('costsUnavailable') : '—')),
              ),
            ),
            costsError ? h('div', { style: S.warn, role: 'status' }, costsError) : null,
            h('div', { style: S.metaRow },
              h('span', {}, `${t('models')}: ${status.models || 0}`),
              h('span', {}, `${t('claudeModels')}: ${status.claudeModels || 0}`),
              h('span', {}, `${t('key')}: ${status.keyConfigured ? t('saved') : t('notSaved')}`),
              h('span', {}, `${t('defaultModel')}: ${status.defaultModel?.model || '—'}`),
            ),
            modelList.length > 0
              ? h('details', { style: S.details },
                  h('summary', { style: S.summary }, `${t('modelsList')} (${modelList.length})`),
                  h('div', { style: S.modelList },
                    modelList.map((model) => h('div', {
                      key: `${model.protocol || 'route'}:${model.id}`,
                      style: S.modelRow,
                    },
                      h('span', { style: S.modelName }, model.name || model.id),
                      h('span', { style: S.modelId }, model.id),
                      h('span', { style: S.modelBadge }, model.protocol === 'anthropic-messages' ? 'Anthropic' : 'OpenAI'),
                      Number.isFinite(model.contextWindow)
                        ? h('span', { style: S.modelMeta }, formatTokens(model.contextWindow))
                        : null,
                      model.reasoning ? h('span', { style: S.modelMeta }, t('reasoning')) : null,
                      Array.isArray(model.input) && model.input.includes('image')
                        ? h('span', { style: S.modelMeta }, t('vision'))
                        : null,
                      status.defaultModel?.provider === model.provider && status.defaultModel?.model === model.id
                        ? h('span', { style: S.defaultBadge }, t('defaultBadge'))
                        : h('button', {
                            type: 'button', style: S.modelButton, disabled: busy,
                            onClick: () => makeDefault(model),
                          }, t('makeDefault')),
                    )),
                  ),
                )
              : null,
            h('div', { style: S.actions },
              h('button', {
                type: 'button', style: S.secondary, disabled: busy,
                onClick: refreshBalance,
              }, busy ? t('loading') : t('refreshBalance')),
              h('button', {
                type: 'button', style: S.secondary, disabled: busy,
                onClick: refreshModels,
              }, t('refreshModels')),
              h('button', {
                type: 'button', style: S.secondary, disabled: busy,
                onClick: () => setEditingKey(true),
              }, t('replaceKey')),
            ),
            h('div', { style: S.links },
              h('a', {
                href: dashboard, target: '_blank', rel: 'noopener noreferrer', style: S.link,
              }, t('topUp')),
              h('a', {
                href: 'https://teamorouter.com/dashboard',
                target: '_blank', rel: 'noopener noreferrer', style: S.link,
              }, t('dashboard')),
            ),
          ) : null;

          return h('section', { style: S.page },
            ...header,
            error ? h('div', { style: S.error, role: 'alert' }, error) : null,
            notice ? h('div', { style: S.notice, role: 'status' }, notice) : null,
            statusCard,
            form,
          );
        }

        ctx.slots.inject('settings.section', () => ctx.slots.register({
          name: 'settings.section',
          id: 'teamorouter-account',
          order: -9,
          label: () => t('nav'),
        }, AccountPage));

        ctx.slots.inject('settings.section.icon', () => ctx.slots.register({
          name: 'settings.section.icon',
          id: 'teamorouter-account',
        }, AccountIcon));

        ctx.slots.inject('settings.models.provider-card', () => ctx.slots.register({
          name: 'settings.models.provider-card',
          key: 'llm-pi-ai',
        }, ProviderBalance));

        ctx.slots.inject('conversation.composer.dock', () => ctx.slots.register({
          name: 'conversation.composer.dock',
          id: 'teamorouter-cost',
          order: 2,
        }, CostPill));

        ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
          name: 'conversation.chat.turnTail',
          id: 'teamorouter-cost',
          order: 15,
        }, TurnCost));

        ctx.slots.inject('conversation.chat.assistant-actions', () => ctx.slots.register({
          name: 'conversation.chat.assistant-actions',
          id: 'teamorouter-cost',
          order: 20,
        }, MessageCost));
      },
    };
  },
});
