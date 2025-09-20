# Документация по формам - Mortgage Calculator TMA

## Обзор

Эта документация описывает полную архитектуру системы форм в приложении Mortgage Calculator TMA, включая поток данных, валидацию, компоненты и лучшие практики.

## 📚 Структура документации

### [Архитектура форм](./architecture.md)
- Общая архитектура системы форм
- Компоненты и их взаимодействие
- Паттерны и принципы проектирования

### [Поток данных](./data-flow.md)
- Инициализация переменных
- Обработка пользовательского ввода
- Трансформация и валидация данных
- Передача в бизнес-логику

### [Система валидации](./validation.md)
- Zod схемы валидации
- Локализованные сообщения об ошибках
- Трансформации данных
- Кастомные валидаторы

### [Компоненты форм](./components.md)
- UI компоненты для форм
- Интеграция с @tanstack/react-form
- Специализированные компоненты
- Паттерны использования

### [Лучшие практики](./best-practices.md)
- Рекомендации по разработке
- Паттерны валидации
- Обработка ошибок
- Производительность

### [Примеры использования](./examples.md)
- Практические примеры
- Шаблоны форм
- Troubleshooting
- FAQ

## 🏗️ Архитектура системы

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   UI Components │    │  Form Management │    │   Validation    │
│                 │    │                  │    │                 │
│ • InputNumber   │◄──►│ • @tanstack/form │◄──►│ • Zod Schemas   │
│ • Select        │    │ • useLoanForm    │    │ • Localization  │
│ • Input         │    │ • Field Context  │    │ • Transformations│
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│  Data Flow      │    │  State Management│    │  Error Handling │
│                 │    │                  │    │                 │
│ • String → Number│    │ • Form State     │    │ • Field Errors  │
│ • Format/Unformat│    │ • Field State    │    │ • Validation    │
│ • Transform     │    │ • Array Fields    │    │ • User Messages │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

## 🔄 Поток данных

### 1. Инициализация
```typescript
// Значения по умолчанию
const defaultLoanDetails: LoanDetailsType = {
  loanAmount: '',
  interestRate: '',
  loanTerm: '',
  startDate: new Date().toISOString().split('T')[0],
  paymentType: 'annuity',
  paymentDay: new Date().getDate().toLocaleString(),
  earlyPayments: [],
  regularPayments: [],
};
```

### 2. Валидация
```typescript
// Zod схема с трансформациями
const loanDetailsSchema = z.object({
  loanAmount: z.string()
    .transform((val) => {
      const unformatted = unformat(val);
      return parseFloat(unformatted);
    })
    .refine((val) => !isNaN(val), 'Loan amount must be a number')
    .refine((val) => val > 0, 'Loan amount must be greater than 0'),
});
```

### 3. Обработка
```typescript
// Отправка формы
onSubmit: async ({ value }) => {
  const loanDetails = unformatFormValues(value);
  const { earlyPayments, regularPayments, ...rest } = loanDetails;
  setLoanDetails(rest);
  setEarlyPayments(earlyPayments);
  setRegularPayments(regularPayments);
  navigate('result');
}
```

## 🎯 Ключевые особенности

### ✅ **Преимущества архитектуры:**
- **Типобезопасность**: Полная типизация с TypeScript
- **Валидация**: Декларативная валидация с Zod
- **Локализация**: Поддержка множественных языков
- **Производительность**: Оптимизированные ререндеры
- **UX**: Плавная работа с форматами чисел

### 🔧 **Технологический стек:**
- **@tanstack/react-form**: Управление состоянием форм
- **Zod**: Валидация и трансформация данных
- **@react-input/number-format**: Форматирование чисел
- **@telegram-apps/telegram-ui**: UI компоненты
- **React Context**: Управление локализацией

## 🚀 Быстрый старт

### Создание простой формы
```typescript
import { useLoanForm } from '@/hooks/useLoanForm';

function MyForm() {
  const form = useLoanForm();
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="loanAmount">
        {(field) => (
          <InputNumberFormat
            {...field.getInputProps()}
            placeholder="Loan Amount"
          />
        )}
      </form.Field>
    </form>
  );
}
```

### Добавление валидации
```typescript
const schema = z.object({
  amount: z.string()
    .transform((val) => parseFloat(unformat(val)))
    .refine((val) => val > 0, 'Amount must be positive'),
});
```

## 📖 Дополнительные ресурсы

- [@tanstack/react-form документация](../../cheatsheets/tanstack-form.md)
- [Zod документация](https://zod.dev/)
- [Telegram UI компоненты](../../cheatsheets/telegram-ui.md)
- [Telegram SDK hooks](../../cheatsheets/telegram-sdk-react.md)

---

**Последнее обновление**: Декабрь 2024  
**Версия**: 1.0.0
