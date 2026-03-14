# Локализация: аудит, правки и мультиязычность

## Что сделано

### 1. Аудит и правки локализации
- **Исправлена валидация поля «День платежа»**: в `localizedSchemas.ts` вместо литералов `'validation.mustBeNumber'` и `'validation.dayOfMonth'` используются ключи переводов `t('mustBeNumber', { field: t('paymentDay') })` и `t('dayOfMonth')`.
- **Удалены неиспользуемые ключи** из `translations.ts` (подсказки hint*, appTitle, totalCost, actualPayoffDate и др.), оставлены только ключи, которые реально вызываются в коде.
- Добавлен отчёт аудита в `docs/LOCALIZATION_AUDIT.md`.

### 2. Поддержка 10 локалей
Добавлены популярные локали для пользователей из разных регионов:

| Код | Язык |
|-----|------|
| en | English |
| ru | Русский |
| es | Español |
| de | Deutsch |
| fr | Français |
| pt | Português (pt-BR) |
| zh | 中文 (упрощённый) |
| it | Italiano |
| uk | Українська |
| tr | Türkçe |

### 3. Изменения в коде
- **`src/localization/locales.ts`** (новый): список локалей, маппинг Telegram `language_code` → локаль, Intl-локали для форматирования, флаг запятой/точки в формах.
- **`LocalizationProvider`**: автоопределение языка через `getLocaleFromTelegram()`, форматирование чисел/дат/валют по выбранной локали (RUB для ru, USD для остальных).
- **`payloadToFormValues`**: тип `FormValuesLocale` расширен до `SupportedLanguage`, разделитель дробной части по `isCommaDecimalLocale()`.
- **`LanguageSwitcher`**: отображает все 10 языков из `SUPPORTED_LOCALES`.
- **`translations.ts`**: полные переводы для es, de, fr, pt, zh, it, uk, tr; в en/ru добавлены ключи названий языков для списка.

## Проверка
- `npm run build` — успешно.
- Линтер без ошибок.
