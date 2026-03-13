# План рефакторинга потока данных и чистой архитектуры

## Цели

- Чистая архитектура потока данных: домен → форма/хранилище/расчёты без циклических зависимостей.
- Единая DTO для формы и хранилища (включая досрочные погашения), чтобы при открытии расчёта сразу проставлять все данные формы.
- Генерация `id` при первом сохранении расчёта для однозначной идентификации.
- Конвенции имён, SOLID, KISS, DRY, единая семантика типов.

---

## 1. Текущее состояние (кратко)

### 1.1 Поток данных

```
[LoanForm] → submit → unformatFormValues → CalculationPayload
    → storage.save(payload) | storage.update(id, payload)
    → navigate('/result', { state: { ...payload, savedId } })

[MortageResult] → location.state | getById(id) → setLoanDetails/setEarlyPayments/setRegularPayments
    → MortgageProvider effects → mortgageService → results
    → useEffect([savedId, ...]) → storage.update(savedId, ...)

[HomePage] → getList() → click → navigate('/result', { state: { ...calc, savedId: calc.id } })
```

### 1.2 Выявленные проблемы

| Проблема | Где |
|----------|-----|
| **Зависимость типов от UI** | `types/storage.ts` и `IMortgageService` импортируют `LoanDetailsValues`, `EarlyPayment`, `RegularPayment` из `MortgageProvider`. Домен не должен зависеть от провайдера. |
| **Дублирование типа payload** | `CalculationPayload` объявлен в `hooks/useLoanForm.ts` и как `Omit<SavedCalculation, 'id' \| 'createdAt'>` в `types/storage.ts`. Один и тот же контракт в двух местах. |
| **Дублирование type guard** | `isCalculationPayload` реализован одинаково в `LoanForm.tsx` и `MortageResult.tsx`. |
| **Дублирование генерации id** | `generateId()` реализована в `MockStorageAdapter` и `TelegramCloudStorageAdapter`. |
| **Смешение ответственности** | Доменные типы (числовые значения кредита/досрочных) живут в `MortgageProvider`; их используют storage и mortgage service — нарушение направленности зависимостей. |
| **Опечатка в названии** | `Mortage` вместо `Mortgage` в имени страницы/роута (по желанию можно исправить в рамках рефакторинга). |

---

## 2. Целевая архитектура слоёв

```
┌─────────────────────────────────────────────────────────────────┐
│  UI: Pages, Components, MortgageProvider (state + effects)       │
│  → используют domain, form types, storage, mortgage service      │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Form layer: useLoanForm, payloadToFormValues, unformatFormValues │
│  → типы формы (strings) в types/form.ts                         │
│  → маппинг form ↔ domain только здесь                           │
└─────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────┐
│  Domain (ядро): типы и контракты данных расчёта                  │
│  → types/domain.ts (или domain/index.ts)                        │
│  → LoanDetails, EarlyPayment, RegularPayment,                   │
│    CalculationData (payload), SavedCalculation, type guards      │
└─────────────────────────────────────────────────────────────────┘
        │                                    │
        ▼                                    ▼
┌──────────────────────┐          ┌──────────────────────────────┐
│  Calculation core    │          │  Storage                      │
│  (utils + service)   │          │  ICalculationsStorage         │
│  → только domain     │          │  → save/update/getById/getList│
│    типы для входа    │          │  → типы из domain             │
└──────────────────────┘          └──────────────────────────────┘
```

Правило: **domain не импортирует ни форму, ни провайдер, ни storage, ни UI.** Форма, storage и расчёты импортируют domain.

---

## 3. Единая DTO и типы домена

### 3.1 Файл доменных типов (новый)

**Путь:** `src/domain/calculation.ts` (или `src/types/domain/calculation.ts`).

Содержимое (концепт):

- **`LoanDetails`** — параметры кредита (числа, дата, тип платежа). Имя можно оставить `LoanDetailsValues` для совместимости или переименовать в `LoanDetails` для краткости.
- **`EarlyPayment`** — одно разовое досрочное погашение (id, date, amount, type).
- **`RegularPayment`** — регулярное досрочное (id, amount, startMonth, endMonth?, type).
- **`CalculationData`** — единая DTO для «тела» расчёта без метаданных:
  - `loanDetails: LoanDetails`
  - `earlyPayments: EarlyPayment[]`
  - `regularPayments: RegularPayment[]`
  Используется: как вход формы после маппинга, как аргумент `storage.save()` / `storage.update()`, как вход для расчётов (вместе с loanDetails + overpayments).
- **`SavedCalculation`** — запись в хранилище:
  - `id: string`
  - `createdAt: string` (ISO)
  - `...CalculationData`
  То есть `SavedCalculation = CalculationData & { id: string; createdAt: string }`.
- **`CalculationPayload`** — убрать как отдельное имя или оставить как алиас: `type CalculationPayload = CalculationData`, чтобы не ломать существующие названия в коде.

Имеет смысл один раз описать типы в domain и везде использовать их: в `types/storage.ts` только реэкспорт из domain (или удалить типы из storage и импортировать из domain). В `MortgageProvider` и `useLoanForm` импортировать из domain.

### 3.2 Конвенция имён

- **Domain (числа, даты, бизнес-сущности):** `LoanDetails`, `EarlyPayment`, `RegularPayment`, `CalculationData`, `SavedCalculation`.
- **Form (строки для инпутов):** `LoanDetailsType`, `EarlyPaymentType`, `RegularPaymentType` в `types/form.ts`.
- **Маппинг:** `calculationDataToFormValues(data, locale)`, `formValuesToCalculationData(values)` — при желании переименовать текущие `payloadToFormValues` / `unformatFormValues` для ясности, что работаем с `CalculationData`. Либо оставить старые имена и просто сменить типы аргументов на domain.

### 3.3 Генерация id

- Вынести **одну** функцию генерации id в домен или в общий модуль storage, например `generateCalculationId(): string`.
- Использовать её в `MockStorageAdapter` и `TelegramCloudStorageAdapter` при `save()`. Так сохраняем DRY и единое место изменения формата id.

### 3.4 Открытие расчёта и проставление формы

- **Единая точка входа:** при открытии расчёта (со списка или по `?id=`) всегда получаем полный объект `SavedCalculation` (из `location.state` или `storage.getById(id)`).
- **Проставление данных:** один раз маппинг в форму:
  - На **Result:** при загрузке по id или state вызываем `setLoanDetails(calc.loanDetails)`, `setEarlyPayments(calc.earlyPayments ?? [])`, `setRegularPayments(calc.regularPayments ?? [])`. Данные уже полные (включая досрочные) — «не постольку поскольку».
  - При переходе «Редактировать параметры» на форму: в `location.state` передаём полный `CalculationData` + `savedId`. В LoanForm `defaultValues = calculationDataToFormValues(state, language)` — форма заполняется целиком (основные поля + досрочные), чтобы при следующем submit и возврате на result всё соответствовало одному расчёту.
- Сейчас на форме калькулятора показываются только основные поля кредита; секции досрочных доступны в модалке на result. Если в будущем на форме калькулятора появятся и досрочные — defaultValues уже будут полными.

Итог: **общая DTO = `CalculationData` (или текущий payload без id/createdAt).** При открытии любого расчёта имеем `SavedCalculation` → из него берём `CalculationData` и при необходимости конвертируем в form values через `calculationDataToFormValues(calc, locale)`.

---

## 4. План шагов рефакторинга

### Фаза 1: Домен и типы

1. **Создать `src/domain/calculation.ts`** (или `src/types/domain.ts`):
   - Перенести из провайдера: `LoanDetailsValues` → в домен как `LoanDetails` (или оставить имя `LoanDetailsValues`), `EarlyPayment`, `RegularPayment`.
   - Добавить `CalculationData` (loanDetails, earlyPayments, regularPayments).
   - Добавить `SavedCalculation` (CalculationData + id + createdAt).
   - Экспортировать тип guard `isCalculationData` / `isSavedCalculation` (или `isCalculationPayload` для совместимости), чтобы использовать в LoanForm и MortageResult в одном месте.
2. **Обновить `types/storage.ts`:**
   - Убрать объявление типов; импортировать и реэкспортировать из domain. Либо оставить только `SavedCalculation` и `CalculationPayload` как реэкспорты из domain.
3. **Обновить `MortgageProvider`:**
   - Импортировать `LoanDetails`, `EarlyPayment`, `RegularPayment` из domain; убрать объявления этих типов из провайдера.
4. **Обновить `hooks/useLoanForm.ts`:**
   - Удалить локальный интерфейс `CalculationPayload`; импортировать `CalculationData` (или `CalculationPayload`) из domain.
5. **Обновить `utils/payloadToFormValues.ts` и `utils/unformatFormValues.ts`:**
   - Типы аргументов/возврата привязать к domain и `types/form.ts` (например `CalculationData` → `LoanDetailsType` и обратно).
6. **Обновить `services/storage`:**
   - В `ICalculationsStorage` использовать типы из domain: `SavedCalculation`, `CalculationData` (для save/update).
   - Вынести `generateCalculationId()` в общий модуль (например `storage/id.ts` или domain), использовать в обоих адаптерах.

### Фаза 2: Storage и единая DTO

7. **Сигнатуры storage:**
   - `save(data: CalculationData): Promise<SavedCalculation>`
   - `update(id: string, data: CalculationData): Promise<SavedCalculation>`
   - Убедиться, что при открытии по id возвращается полный `SavedCalculation` (все поля, включая пустые массивы досрочных).
8. **Страницы:**
   - LoanForm: при submit передавать в storage и в `navigate` один и тот же объект (CalculationData + после save — savedId). При инициализации формы из `location.state` использовать полный state как CalculationData и маппить в defaultValues.
   - MortageResult: при загрузке по id вызывать `getById(id)` → один раз установить в контекст `loanDetails`, `earlyPayments`, `regularPayments` из полученного `SavedCalculation`. Убрать дублирование type guard — импортировать из domain.
   - HomePage: при клике передавать в state полный объект расчёта (уже так: `loanDetails`, `earlyPayments`, `regularPayments`, `savedId`). Тип — `SavedCalculation` или его часть для state.

### Фаза 3: Сервис расчётов

9. **`IMortgageService` и реализация:**
   - Импортировать `EarlyPayment`, `RegularPayment`, типы дат/чисел из domain (или оставить только из financialMath для PaymentType). Параметры расчёта должны описываться через domain (LoanDetails + earlyPayments + regularPayments), а не через провайдер.
10. **MortgageProvider:** только хранит state и вызывает mortgage service; типы данных — из domain.

### Фаза 4: Чистка и конвенции

11. Удалить дубликаты: один `CalculationPayload`/`CalculationData`, один `isCalculationPayload` в domain (или types).
12. Проверить все импорты: форма, storage, mortgage service не импортируют друг друга по кругу; провайдер не является источником типов для storage/service.
13. (Опционально) Переименование Mortage → Mortgage: заменить в путях файлов, роутах, импортах. Можно вынести в отдельный коммит.

---

## 5. Угловые кейсы и решения

| Кейс | Решение |
|------|--------|
| **Открытие /result без state и без ?id** | Оставить текущее поведение: показывать placeholder «Нет расчёта», кнопка «Перейти к калькулятору». Не вызывать setLoanDetails и т.д. |
| **Открытие по ?id=..., расчёт удалён** | `getById(id)` возвращает `null`. Не устанавливать контекст; показать тот же placeholder или отдельное сообщение «Расчёт не найден» с кнопкой на список/калькулятор. |
| **Первый расчёт без сохранения** | Сейчас при первом нажатии «Рассчитать» вызывается `storage.save(payload)` → возвращается `SavedCalculation` с id → навигация с `savedId`. Id генерируется при первом save. После рефакторинга можно при желании генерировать id на клиенте до save (например в LoanForm) и передавать его в save — тогда контракт save может принимать опциональный id. Текущее поведение (id при save) оставить допустимым. |
| **Редактирование на result без savedId** | Если пользователь попал на result только через state (без сохранения), savedId может быть пустым. useEffect с `storage.update(savedId, ...)` не должен вызываться при отсутствии savedId — уже так: `if (!savedId \|\| !loanDetails) return`. |
| **Два источника правды при загрузке (state и id)** | Приоритет: если в state есть полный CalculationData (по type guard), использовать его и не вызывать getById. Иначе если есть id в searchParams — загрузить через getById. Иначе — пусто. Это уже реализовано; после рефакторинга оставить ту же логику, но типизировать state как SavedCalculation/CalculationData. |
| **Локализация при восстановлении формы** | `payloadToFormValues(payload, locale)` уже принимает locale; при открытии формы из истории или с result передавать текущий язык. Без изменений. |
| **Валидация при открытии по id** | Данные из storage считаются уже пройденными через форму при сохранении. При открытии по id дополнительная валидация не обязательна; при желании можно прогонять через ту же Zod-схему и подставлять дефолты для битых полей. |
| **update(id, data) при несуществующем id** | В адаптерах при index === -1 выполняется insert с переданным id. Поведение оставить: если front когда-то передаст id без записи в списке, запись будет создана. Для «нормального» сценария id всегда есть после save. |
| **Модалка досрочных при отсутствии loanDetails** | Уже: контент модалки рендерится только при наличии defaultValues (от loanDetails). При отсутствии loanDetails модалка не должна открываться (кнопка «Добавить досрочные» доступна только при hasPayload && loanDetails). Без изменений. |

---

## 6. Итоговый чеклист

- [x] Доменный слой: один файл с типами и type guard, без зависимостей от UI/storage.
- [x] Единая DTO: `CalculationData` (payload без id/createdAt); форма и хранилище используют её.
- [x] При открытии расчёта (state или getById) один раз выставляем полные данные в контекст/форму из `SavedCalculation`.
- [x] Одна реализация `generateCalculationId()`, используется в обоих адаптерах.
- [x] Storage и IMortgageService зависят только от domain (и своих контрактов).
- [x] Убраны дубли: один тип payload, один type guard, одна генерация id.
- [x] Конвенция имён: domain — бизнес-типы; form — строковые типы для инпутов.
- [x] Угловые кейсы обработаны (нет state/id, удалён расчёт, нет savedId при update).

После выполнения плана поток данных будет явным, масштабирование (новые поля в расчёте, новые экраны) — за счёт изменения domain и маппинга формы, без размазывания типов по провайдеру и страницам.
