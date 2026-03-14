# MR: Доработки UI — графики, темы, настройки

## Обзор
Улучшения графиков погашения, единая палитра цветов из темы Telegram, короткие подписи в сводке, замена селекта на радио для типа досрочного погашения, разделение графиков и мелкие правки.

---

## 1. Цвета и тема

- **themeColors.ts** — новый модуль вместо `chartsTheme.ts`: единая точка получения цветов приложения из палитры Telegram (`getThemeColors`, `getTelegramPalette`, `TelegramPalette`, `PALETTE_LABELS`).
- **Удалён chartsTheme.ts** — логика перенесена в `themeColors.ts`.
- Графики и UI используют только цвета из палитры: основной долг — `link`, проценты — `destructiveText`, остаток — `text`, досрочный платёж — `hint` (чтобы не совпадал с основным долгом).
- В настройках добавлена секция «Цвета темы» с превью палитры (для отладки/проверки).

## 2. Графики

- **Два графика вместо одного:**
  - «Состав платежа» (`chartPaymentStructure`) — соотношение основного долга и процентов в платеже (две линии с заливкой).
  - «Погашение основного долга (остаток)» (`chartBalanceDecrease`) — остаток долга по времени (одна ось).
- **График остатка при досрочных:**
  - Линия «По плану» (без досрочных) и «Факт» (с досрочными).
  - Маркеры в месяцах с досрочным погашением (точки на линии).
- **Отображение по месяцам** — убрана агрегация по годам для графика погашения и графика ежемесячного платежа.
- **Линия «Основной долг»** на графике состава платежа — сумма планового principal + досрочные за период (при «уменьшении платежа» линия не падает к нулю).
- **Полупрозрачная заливка** под линией остатка на втором графике (как на первом).
- Заголовок первого графика укорочен: «Состав платежа» вместо «Соотношение основного долга и процентов в платеже».

## 3. Сводка и локализация

- Короткие подписи в сводке по платежам: «Экономия» вместо «Общая экономия на процентах», «Сумма выплат», «Дата погашения» (RU и аналоги по другим языкам).
- Добавлены ключи: `chartPaymentStructure`, `chartBalanceDecrease`, `chartBalancePlanned`, `chartBalanceActual`, `chartBalanceExtraMarkers`, `chartPaymentStructure` (короткие формулировки), `themeColors`.

## 4. Форма досрочных платежей

- **TypeRadioGroup** — выбор типа «Сократить срок» / «Уменьшить платёж» через радио (Cell + Radio из telegram-ui) вместо селекта (избежание зависаний).
- Кнопки в форме: «Готово» — `mode='filled'`, «Удалить» — `mode='outline'`, обёрнуты в flex для аккуратного ряда.
- Используется в `EarlyPaymentsForm` и `RegularPaymentsForm`.

## 5. Прочее

- **Deploy:** при `npm run deploy` версия в `package.json` инкрементируется (patch) через `npm version patch --no-git-tag-version` в predeploy.
- Плагин фона области графика (chartAreaBackground) удалён — не используется.

---

## Затронутые файлы

- `package.json` — скрипты version:bump, predeploy
- `src/config/themeColors.ts` — новый
- `src/config/chartsTheme.ts` — удалён
- `src/components/charts/LineChart.tsx` — singleYAxis, leftAxisTitle, опции датасетов (pointRadius, showLine), удалён плагин фона
- `src/components/result/ChartsContainer.tsx` — два графика, данные для плана/факта и маркеров, themeColors
- `src/components/result/ResultsDisplay.tsx` — не менялся в текущем наборе (короткие подписи только в translations)
- `src/components/form/EarlyPaymentsForm.tsx` — TypeRadioGroup, кнопки
- `src/components/form/RegularPaymentsForm.tsx` — TypeRadioGroup, кнопки
- `src/components/ui/TypeRadioGroup.tsx` — новый
- `src/pages/SettingsPage/SettingsPage.tsx` — секция «Цвета темы», убран переключатель полноэкранного режима
- `src/providers/ThemeProvider.tsx` — импорт из themeColors
- `src/localization/translations.ts` — новые ключи и короткие подписи
