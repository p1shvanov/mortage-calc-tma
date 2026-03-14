# Аудит файлов локализации

**Дата:** 14.03.2025  
**Файлы:** `src/localization/translations.ts`, `src/providers/LocalizationProvider.tsx`, использование `t()` в коде.

---

## 1. Структура и корректность

### 1.1 Состав файлов

- **translations.ts** — один объект с ключами `en` и `ru`, структура совпадает.
- Все ключи присутствуют в обоих языках, дублирования ключей нет.
- Плейсхолдеры в строках (`{field}`, `{value}`, `{n}`, `{from}`, `{to}`, `{total}`, `{name}`, `{p}`, `{i}`) обрабатываются в `LocalizationProvider` через `replace`.

### 1.2 Смысловое соответствие EN ↔ RU

| Ключ | EN | RU | Комментарий |
|------|----|----|-------------|
| paymentSummary | Payment Summary | Сводка по платежам | ✓ |
| accruedInterest | Accrued interest | Начисленные проценты | ✓ |
| overpaymentPercent | Overpayment (%) | Переплата (%) | ✓ |
| totalPayout | Total amount to pay | Общая сумма выплат | ✓ |
| totalSavings | Total Interest Savings | Общая экономия на процентах | ✓ |
| planPayoffDate | Plan Payoff Date | Плановая дата погашения | ✓ |
| annuityPayment | Annuity | Аннуитетный | ✓ |
| differentiatedPayment | Differentiated | Дифференцированный | ✓ |
| typeReduceTerm | Reduce Term | Сократить срок | ✓ |
| typeReducePayment | Reduce Payment | Уменьшить платеж | ✓ |
| showingPayments | Showing payments {from}-{to} of {total} | Платежи {from}-{to} из {total} | ✓ |
| paymentOrdinal (en) | Payment {n} | — | В RU: «{n}-й платёж» — корректно. |
| languageFlag (en) | 🇬🇧 | — | Флаг UK; для «English» часто используют 🇺🇸 или 🇬🇧 — на усмотрение продукта. |
| languageFlag (ru) | — | 🇷🇺 | ✓ |

Замечаний по смыслу переводов нет; формулировки по смыслу совпадают.

---

## 2. Исправленная ошибка

### 2.1 Валидация поля «День платежа» (paymentDay)

**Было:** В `src/schemas/localizedSchemas.ts` для `paymentDay` использовались литеральные строки:

- `'validation.mustBeNumber'`
- `'validation.dayOfMonth'`

Они не являются ключами в `translations`, поэтому пользователь видел в интерфейсе именно эти строки вместо перевода.

**Стало:** Подключён `useLocalization()`, сообщения задаются через:

- `t('mustBeNumber', { field: t('paymentDay') })`
- `t('dayOfMonth')`

Сообщения валидации для дня платежа теперь локализуются.

---

## 3. Использование ключей

### 3.1 Ключи, которые используются в коде

Используются в вызовах `t(...)` в компонентах и валидации:

- **Валидация:** invalidNumber, mustBePositive, mustBeNumber, mustBeGreaterThan, mustBeLessThan, invalidDate, endDateAfterStart, dayOfMonth  
- **Поля формы:** loanDetails, loanAmount, interestRate, loanTerm, startDate, paymentType, annuityPayment, differentiatedPayment, paymentDay, additionalOptions  
- **Досрочные/регулярные платежи:** earlyPayment, earlyPaymentAmount, earlyPaymentDate, earlyPaymentType, typeReduceTerm, typeReducePayment, addEarlyPayment, editEarlyPayments, fillLoanDetailsFirst, regularPayment, regularPaymentAmount, startMonth, endMonth, addRegularPayment, earlyPaymentType, done, remove  
- **Результаты:** paymentSummary, monthlyPayment, accruedInterest, overpaymentPercent, totalPayout, totalSavings, loanTerm, years, months, monthsSaved, planPayoffDate, paymentType, annuityPayment, differentiatedPayment  
- **График/графики:** paymentSchedule, showingPayments, insufficientPayment, principal, interest, paymentBreakdown, paymentDetailTitle, paymentDate, paymentAmount, paymentStructureRatio, interestToDate, remainingBalance, extraPayment, amortizationSchedule, balance, interestRemaining, interestSaved, original, withEarlyPayments, totalInterest, mortgageComparison, totalPaymentBreakdown, interestSavings  
- **Навигация и общее:** home, calculator, resultTitle, editParameters, goToHome, goToCalculator, newCalculation, calculationHistory, noCalculationsYet, goToCalculator, loading, loadingCalculation, calculationNotFound, loadError, retry, open  
- **Настройки:** language, settings, fullscreen, fullscreenOn, fullscreenOff, addToHomeScreen, addToHomeScreenSubtitle, about, theme, themeLight, themeDark, version  
- **Язык:** languageEnglish, languageRussian (через LanguageSwitcher)  
- **Действия и статусы:** calculate, backToHome, apply, fixFormErrors, saveError, removed, greeting, greetingAnonymous  

### 3.2 Ключи из translations, которые нигде не вызываются

Эти ключи есть в `translations.ts`, но в коде нет вызовов `t('...')` с таким ключом:

| Ключ | Назначение |
|------|------------|
| **appTitle** | Заголовок приложения (например, для документа/тега title или шапки). |
| **homeValue** | Стоимость недвижимости (поля в форме нет). |
| **downPayment** | Первоначальный взнос (поля в форме нет). |
| **paymentDayMonthly** | «В тот же день, что и дата начала» — вариант выбора дня платежа. |
| **paymentDaySpecific** | «Конкретный день месяца» — вариант выбора. |
| **hintLoanAmount** … **hintEarlyPaymentType** | Подсказки (tooltips) для полей — ни одно поле их не показывает. |
| **totalCost** | Общая стоимость (в UI используется totalPayout и др.). |
| **actualPayoffDate** | Фактическая дата погашения. |
| **earlyPaymentMonth** | Месяц платежа (в форме используется earlyPaymentDate). |
| **earlyPaymentList** | Заголовок списка досрочных платежей. |
| **paymentHistory** | Досрочные платежи (история). |
| **totalEarlyPayments** | Всего досрочных платежей. |
| **errorPaymentAmount**, **errorPaymentMonth**, **errorPaymentDate** | Сообщения валидации досрочных платежей. |
| **yes** | «Да». |
| **before**, **after** | «Было» / «Стало» (сравнение до/после). |
| **finalPayment**, **originalPayment** | Итоговый/первоначальный платёж. |
| **savings** | Экономия на процентах (используются totalSavings, monthsSaved). |
| **amortization** | График платежей (используется amortizationSchedule). |
| **month**, **date**, **payment** | Месяц, дата, платёж (в графике используются другие формулировки). |
| **paymentOrdinal** | «Платёж {n}» / «{n}-й платёж». |
| **previous**, **next** | Назад/вперёд (пагинация и т.п.). |
| **graphicalView** | Графическое представление. |
| **paymentDistribution** | Распределение платежей. |
| **newTotalInterest** | Новая общая сумма процентов. |
| **monthlyPaymentBreakdown** | Ежемесячная структура платежей. |
| **errorHomeValue**, **errorDownPayment**, **errorDownPaymentMax**, **errorInterestRate**, **errorLoanTerm** | Валидация полей (home/down payment и т.д.) — форма их не использует. |
| **reset** | Сбросить. |
| **languageFlag** | Флаг языка (в LanguageSwitcher показываются только названия). |
| **comingSoon** | Скоро. |
| **saved** | Сохранено (в тостах используется «removed», «saveError»). |
| **paidPercent** | Погашено. |

Рекомендации:

- **Оставить** ключи, которые планируется использовать (например, appTitle для title/header, подсказки при добавлении тултипов, сообщения валидации при появлении полей home/down payment).
- **Удалить** только те ключи, которые точно не будут использоваться, чтобы не раздувать файл.
- **Подключить** ключи там, где логика уже есть (например, `before`/`after`, `previous`/`next`, `savings`, `paymentOrdinal`), если это улучшит UX.

---

## 4. Итоги

| Проверка | Результат |
|----------|-----------|
| Структура (en/ru, ключи) | ✓ Одинаковая, без дублей. |
| Смысл переводов | ✓ Соответствуют. |
| Обработка плейсхолдеров | ✓ Реализована в провайдере. |
| Валидация paymentDay | ✓ Исправлено: используются t('mustBeNumber'), t('dayOfMonth'). |
| Неиспользуемые ключи | Много ключей не вызываются; часть — задел под будущие фичи (подсказки, поля home/down, плейсхолдеры). |

Локализация составлена корректно и по смыслу отображает нужные значения. Все ключи, которые реально показываются пользователю, используются через `t()`. Часть ключей зарезервирована под будущее использование или не подключена в UI — при необходимости их можно либо начать использовать, либо удалить после согласования с продуктом.
