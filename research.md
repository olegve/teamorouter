# Исследования проблемы

Результаты исследования API TeamoRouter и точек расширения DeepSeek Harness,
на которых построен плагин. Контекст задачи — в [AGENTS.md](AGENTS.md); план
работ — в [plan.md](plan.md); страница аккаунта — в [accaunt.md](accaunt.md);
визуализация затрат — в [costs.md](costs.md).

## Подключение

- Штатный DSH уже умеет добавлять произвольный OpenAI/Anthropic-совместимый
  провайдер: **Settings → Models → Add model provider → Custom model API**.
  Для TeamoRouter:
  - Provider ID: `teamorouter`
  - Base URL: `https://api.teamorouter.com/v1`
  - Protocol: OpenAI Chat Completions
  - API key: `sk-teamo-...`
- То есть подключение возможно и без плагина; плагин должен добавить
  **готовый пресет** (baseURL + список моделей + discovery), чтобы TeamoRouter
  появился в каталоге провайдеров по имени.
- Один custom-провайдер = один протокол. Для Claude нужен отдельный маршрут
  `teamorouter-anthropic` с протоколом **Anthropic Messages** и Base URL
  `https://api.teamorouter.com` (без `/v1`): через OpenAI-формат Claude теряет
  prompt caching и thinking.
- В текущем профиле пользователя TeamoRouter уже настроен
  (`llm-pi-ai.providers.teamorouter`, модель `deepseek-flash-1017`), этот факт
  учитывать при проверке и не перезаписывать пользовательскую конфигурацию.

## Модели

- Один custom-провайдер DSH = один протокол, поэтому модели разделяются:
  Claude → `teamorouter-anthropic` (`anthropic-messages`), остальные →
  `teamorouter` (`openai-completions`).
- `/v1/models/pricing` даёт контекст и максимальный output; по семейству
  модели автоматически задаются vision (`input: text,image`) и reasoning
  levels.
- Список моделей с протоколом и возможностями показывается на странице
  «TeamoRouter».

## Аккаунт и баланс

- Всё про учётную запись, баланс и страницу «TeamoRouter» вынесено в
  отдельный документ: [accaunt.md](accaunt.md).
- Кратко: `GET /v1/billing/balance`; ключ резолвится и используется только на
  Host-стороне. Штатная страница «Аккаунт» не расширяется — внутри неё нет
  под-слотов. Баланс показываем отдельной секцией (`order: -9`) и/или строкой
  в карточке провайдера TeamoRouter.
- Подробности, варианты размещения и план — в [accaunt.md](accaunt.md).

## Стоимость запроса

План визуализации затрат — в [costs.md](costs.md).

- В сессии DSH для каждого assistant-сообщения сохраняется `usage`
  (input/output, cache read/write, reasoning tokens) и провайдер/модель.
  Это готовый источник данных, менять ядро не нужно.
- Публичный прайс TeamoRouter: `GET /v1/models/pricing` (доступен без ключа).
  Содержит `input`, `output`, `cached_input`, `cache_creation`, `cache_read`,
  контекстные тарифы, peak/off-peak-множители.
- Расчётная стоимость считается сразу:

  ```text
  uncached_input * input_price
  + cache_read    * cache_read_price
  + cache_write   * cache_creation_price
  + output        * output_price
  с поправкой на peak/off-peak и контекстный тариф
  ```

- Это **оценка**, а не точное списание: цены меняются в реальном времени, есть
  peak/off-peak, контекстные множители, fast mode ×2, округление и резерв
  максимальной стоимости на длинном контексте. В UI показывать как `≈`.
- **Точная сумма за конкретный запрос** доступна через
  `GET /v1/billing/requests/{request_id}`, но нужен `request_id`.
  Штатный OpenAI-адаптер DSH отдаёт плагину только поток чанков и не раскрывает
  HTTP-заголовки ответа, поэтому точную сумму обычной надстройкой не получить.
  Варианты: свой LLM-адаптер, локальный прокси либо отказ от точности в пользу
  оценки.
- Дневные и месячные затраты — `GET /v1/billing/costs` и `/v1/usage` за
  период; это фактические суммы, а не оценка.
- Точная сумма **за сессию** (агрегат) получается через `GET /v1/billing/costs`
  без `request_id`.

## Ключевые выводы

- Подключение через штатный Custom model API возможно, но плагин даёт
  готовый сценарий «ключ → подключение → модели → баланс».
- Баланс и точная стоимость за сессию доступны через billing API; стоимость
  за конкретный запрос — только оценочная без `request_id`. План
  визуализации — в [costs.md](costs.md).
- Для Claude предпочтителен отдельный Anthropic-маршрут.
- Все UI-изменения делаются через слоты, поэтому один bundle устанавливается
  и удаляется целиком.

## Источники

- [TeamoRouter API Integration](https://teamorouter.com/docs/api-integration)
- [Usage and Billing APIs](https://teamorouter.com/docs/open-api)
- [DeepSeek Harness setup](https://teamorouter.com/docs/install-deepseek-harness)
- [Модели и цены](https://teamorouter.com/models)
