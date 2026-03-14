# Refactor: архитектура, конфиг, UI

**Ветка:** `refactor/architecture-storage-mortgage-settings`  
**Тип:** refactor

---

## Описание

Рефакторинг архитектуры расчётов и настроек, упрощение слоя mortgage-сервиса, исправление опечаток и доработка экрана результата.

---

## Изменения

### 1. Опечатка Mortage → Mortgage
- Страница результата переименована: `MortageResult` → `MortgageResult` (папка и компонент).
- В роутах и README обновлены название и заголовок.

### 2. Контекст расчёта только на странице результата
- **Удалён глобальный `MortgageProvider`** из `Root`. Storage остаётся единственным источником правды для сохранённых расчётов.
- Добавлен хук **`useCalculationWithResults(id)`**: загрузка расчёта из storage по `id`, расчёт base + schedule, синхронизация с storage при изменениях.
- Контекст доступен только на странице результата через **`MortgageContextProvider`** (value из хука). Компоненты `ResultsDisplay`, `ChartsContainer`, `PaymentSchedule`, `EarlyPaymentsModal` по-прежнему используют `useMortgage()`.

### 3. Валидация: один источник схем
- Удалён глобальный **`z.setErrorMap`** в `createLocalizedSchemas` (избежание побочных эффектов).
- **EarlyPaymentsForm** и **RegularPaymentsForm** переведены на `useLocalizedFormSchemas()`; удалены дублирующие схемы с хардкодом сообщений:
  - `schemas/loanDetails.ts`
  - `schemas/earlyPayment.ts`
  - `schemas/regularPayment.ts`

### 4. Упрощение mortgage-сервиса (заготовки под API убраны)
- Удалены: **MortgageServiceFactory**, **ServerMortgageService**, **config/mortgage.ts**.
- В `services/mortgage` экспортируется один инстанс: `mortgageService = new LocalMortgageService()`.
- Удалён deprecated метод **`calculateMortgage`** из `IMortgageService` и реализаций.

### 5. Настройки
- Секция «Настройки» показывается только если есть хотя бы один пункт (fullscreen и/или «Добавить на главный экран»).
- Пункт «Добавить на главный экран» перенесён внутрь секции «Настройки».

### 6. Сборка и бандл
- **vite**: `drop_console: true`, `sourcemap: false` для production.
- Удалён неиспользуемый **RadarChart.tsx**.

### 7. Экран результата (сводка по платежам)
- При наличии досрочных погашений для **«Переплата (%)»** и **«Общая сумма выплат»** выводится формат «было → стало» (как для начисленных процентов и срока).

### 8. Документация
- README: актуальная структура папок, описание без упоминания server/конфига mortgage; ключевые компоненты (storage, MortgageResult, LoanForm).
- `services/mortgage/README.md`: только локальная реализация и использование `mortgageService`.

---

## Файлы

**Новые:**  
`src/hooks/useCalculationWithResults.ts`, `src/pages/MortgageResult/MortgageResult.tsx`, `src/pages/MortgageResult/index.ts`

**Удалённые:**  
`src/pages/MortageResult/*`, `src/config/mortgage.ts`, `src/schemas/loanDetails.ts`, `src/schemas/earlyPayment.ts`, `src/schemas/regularPayment.ts`, `src/services/mortgage/MortgageServiceFactory.ts`, `src/services/mortgage/ServerMortgageService.ts`, `src/components/charts/RadarChart.tsx`

**Изменённые:**  
README.md, Root.tsx, routes.tsx, MortgageProvider.tsx, createLocalizedSchemas.ts, EarlyPaymentsForm.tsx, RegularPaymentsForm.tsx, SettingsPage.tsx, ResultsDisplay.tsx, services/mortgage (index, IMortgageService, LocalMortgageService, README), vite.config.ts

---

## Проверка

- [ ] `npm run build` — успешно
- [ ] `npm run test` — все тесты проходят
- [ ] `npm run lint` — без ошибок
- [ ] Главная → список расчётов, создание/открытие расчёта, результат с графиками и сводкой
- [ ] Редактирование досрочных на странице результата, обновление сводки (в т.ч. переплата % и общая сумма «было → стало»)
- [ ] Настройки: при отсутствии fullscreen секция «Настройки» не показывается; при наличии — в ней fullscreen и при необходимости «Добавить на главный экран»
