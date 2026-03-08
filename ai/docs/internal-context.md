# Внутренний контекст проекта mortage-calc-tma

Краткая сводка для быстрой ориентации в кодовой базе (для AI и разработки).

---

## Что это

**Telegram Mini App** — калькулятор ипотеки/кредита: сумма, ставка, срок, тип платежа (аннуитет/дифференцированный), досрочные (разовые и регулярные). Результаты: платёж, график амортизации, графики (Chart.js), таблица. Локализация en/ru, тема light/dark из Telegram.

**Стек:** React 18 + TypeScript, Vite 6, HashRouter, TanStack Form + Zod, @telegram-apps/sdk-react + telegram-ui, Chart.js, TON Connect. Бэкенда нет — расчёты локально или опционально через API.

**Деплой:** GitHub Pages (статика), workflow на push в master.

---

## Структура src/

| Путь | Назначение |
|------|------------|
| `components/` | UI: form/, charts/, общие (Page, Layout, TabView, Link, Table, ErrorBoundary) |
| `pages/` | LoanForm, MortageResult, InitDataPage, ThemeParamsPage, LaunchParamsPage |
| `providers/` | LocalizationProvider, MortgageProvider; ThemeProvider есть, в Root не подключён |
| `services/mortgage/` | IMortgageService, LocalMortgageService, ServerMortgageService, MortgageServiceFactory |
| `navigation/` | routes.tsx, Router.tsx (HashRouter) |
| `hooks/` | useLoanForm, useLocalizedSchemas |
| `schemas/` | Zod: formSchema, loanDetails, earlyPayment, regularPayment, localizedSchemas |
| `localization/` | translations (en/ru) |
| `config/` | mortgage.ts (serviceType, apiBaseUrl) |
| `utils/` | mortgageCalculator, amortizationSchedule, financialMath, unformatFormValues |
| `css/` | bem.ts, classnames; стили в index.css, ui.module.css, компонентные *.css |

**Важно:** опечатка в названии — «Mortage» (страница MortageResult, папка и т.д.).

---

## Точки входа и роутинг

- **Вход:** `index.html` → `src/index.tsx` → при успешном `retrieveLaunchParams()` рендер `<Root />`, иначе `<EnvUnsupported />`.
- **Root:** ErrorBoundary → LocalizationProvider → MortgageProvider → App (AppRoot telegram-ui + Router).
- **Маршруты:** `/` — LoanForm, `/result` — MortageResult, `/init-data`, `/theme-params`, `/launch-params`; `*` → Navigate to `/`.

**⚠️ Роутинг:** В `routes.tsx` маршруты заданы как `{ path, Component }`, а в `Router.tsx` делается `<Route {...route} />`. В react-router-dom v6 `Route` ожидает `element`, а не `Component`. Нужно либо в routes передавать `element: <Component />`, либо в Router маппить `Component` → `element`.

---

## Состояние и данные

- **Глобальное состояние:** только React Context (MortgageProvider, LocalizationProvider). Redux/Zustand нет.
- **MortgageProvider:** loanDetails, earlyPayments, regularPayments, mortgageResults, amortizationResult; при изменении входных данных вызываются mortgageService.calculateMortgage и generateAmortizationSchedule.
- **Формы:** TanStack Form + zod; useLoanForm связан с провайдером, при сабмите — navigate('result').
- **Расчёты:** IMortgageService — LocalMortgageService (в браузере) и ServerMortgageService (API). Выбор в config (serviceType, apiBaseUrl).
- **Персистенция:** localStorage/sessionStorage в коде не используются; состояние только в памяти. Запланировано: глобальное хранилище (TASK-30, ai/docs/storage).

---

## Соглашения

- Алиас импортов: `@/` → `./src/*` (tsconfig paths).
- Компоненты и файлы страниц: PascalCase (LoanForm.tsx, MortageResult.tsx).
- Стили: BEM-хелперы в `src/css/bem.ts`, часть компонентов со своими .css.
- Правил .cursor/rules в репозитории нет; доп. материал — в `ai/` (таски, storage docs).

---

## Конфиг и окружение

- **Vite:** base `/mortage-calc-tma/`, React+SWC, tsconfig paths, по HTTPS=true — mkcert; чанки (vendor-react, vendor-telegram, vendor-charts, vendor-forms); terser, sourcemap в prod.
- **Скрипты:** `dev`, `dev:https`, `build` (tsc --noEmit && vite build), `lint`/`lint:fix`, `preview`, `deploy` (gh-pages).
- Тестов в package.json нет.

---

## Ближайшие задачи (из ai/)

- **TASK-30:** глобальное хранилище — локальное + Telegram Cloud Storage, синхронизация, офлайн (см. ai/tasks/TASK-30-global-storage.md, ai/docs/storage/).

---

*Обновлено по коду; при расхождении приоритет у кода.*
