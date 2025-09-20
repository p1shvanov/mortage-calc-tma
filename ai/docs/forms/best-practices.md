# Лучшие практики работы с формами

## Обзор

Документация содержит рекомендации по разработке, поддержке и оптимизации форм в приложении Mortgage Calculator TMA, основанные на опыте разработчиков библиотек и best practices индустрии.

## 🏗️ Архитектурные принципы

### 1. Разделение ответственности

#### ✅ Правильно
```typescript
// Схемы - только валидация
const loanDetailsSchema = z.object({
  loanAmount: z.string().transform(/* трансформация */).refine(/* валидация */),
});

// Хуки - управление состоянием
const useLoanForm = () => {
  return useAppForm({
    validators: { onChange: formSchema },
    onSubmit: handleSubmit,
  });
};

// Компоненты - отображение
const LoanDetailsForm = withForm({
  render: ({ form }) => <FormFields form={form} />,
});
```

#### ❌ Неправильно
```typescript
// Смешение ответственности
const LoanDetailsForm = () => {
  // Валидация
  const validate = (data) => { /* ... */ };
  
  // Управление состоянием
  const [formData, setFormData] = useState();
  
  // Бизнес-логика
  const calculate = (data) => { /* ... */ };
  
  // UI логика
  return <div>{/* ... */}</div>;
};
```

### 2. Типобезопасность

#### ✅ Правильно
```typescript
// Строгая типизация
interface FormFieldProps {
  field: FieldApi<any, any, any, any>;
  name: string;
  validation?: ZodSchema;
}

// Выведение типов из схем
type LoanDetailsType = z.infer<typeof loanDetailsSchema>;
type ValidatedLoanDetails = z.infer<typeof loanDetailsSchema>;
```

#### ❌ Неправильно
```typescript
// Слабая типизация
interface FormFieldProps {
  field: any;
  name: string;
  validation?: any;
}

// Использование any
const handleSubmit = (data: any) => {
  // Обработка данных
};
```

### 3. Переиспользование

#### ✅ Правильно
```typescript
// Переиспользуемые компоненты
const NumberField = ({ name, ...props }) => (
  <form.Field name={name}>
    {(field) => (
      <InputNumberFormat
        {...field.getInputProps()}
        field={field}
        {...props}
      />
    )}
  </form.Field>
);

// Переиспользуемые хуки
const useArrayField = (name: string) => {
  const form = useFormContext();
  
  const addItem = (item: any) => {
    form.setFieldValue(name, (old) => [...old, item]);
  };
  
  return { addItem };
};
```

#### ❌ Неправильно
```typescript
// Дублирование кода
const LoanAmountField = () => (
  <form.Field name="loanAmount">
    {(field) => (
      <InputNumberFormat
        {...field.getInputProps()}
        field={field}
        inputMode="decimal"
      />
    )}
  </form.Field>
);

const InterestRateField = () => (
  <form.Field name="interestRate">
    {(field) => (
      <InputNumberFormat
        {...field.getInputProps()}
        field={field}
        inputMode="decimal"
      />
    )}
  </form.Field>
);
```

## 🔄 Управление состоянием

### 1. Принципы состояния

#### ✅ Правильно
```typescript
// Единый источник истины
const useLoanForm = () => {
  const { formSchema } = useLocalizedFormSchemas();
  
  return useAppForm({
    defaultValues: defaultLoanDetails,
    validators: { onChange: formSchema },
    onSubmit: handleSubmit,
  });
};

// Локальное состояние только для UI
const [isAccordionOpen, setIsAccordionOpen] = useState(false);
```

#### ❌ Неправильно
```typescript
// Множественные источники состояния
const [formData, setFormData] = useState();
const [validationErrors, setValidationErrors] = useState();
const [isSubmitting, setIsSubmitting] = useState();

// Дублирование состояния
const [loanAmount, setLoanAmount] = useState();
const [interestRate, setInterestRate] = useState();
```

### 2. Обновление состояния

#### ✅ Правильно
```typescript
// Функциональные обновления
form.setFieldValue('loanAmount', (old) => newValue);

// Батчинг обновлений
form.setFieldValue('loanDetails', (old) => ({
  ...old,
  loanAmount: newValue,
  interestRate: newRate,
}));
```

#### ❌ Неправильно
```typescript
// Прямое мутирование
form.state.values.loanAmount = newValue;

// Множественные обновления
form.setFieldValue('loanAmount', newValue);
form.setFieldValue('interestRate', newRate);
form.setFieldValue('loanTerm', newTerm);
```

## 🎯 Валидация

### 1. Структура валидации

#### ✅ Правильно
```typescript
// Трансформация перед валидацией
z.string()
  .transform((val) => parseFloat(unformat(val)))
  .refine((val) => !isNaN(val), 'Must be a number')
  .refine((val) => val > 0, 'Must be positive');

// Композиция схем
const baseSchema = z.object({
  amount: z.string().transform(/* трансформация */),
});

const extendedSchema = baseSchema.extend({
  id: z.string(),
  type: z.enum(['reduceTerm', 'reducePayment']),
});
```

#### ❌ Неправильно
```typescript
// Валидация перед трансформацией
z.string()
  .refine((val) => !isNaN(parseFloat(val)), 'Must be a number')
  .transform((val) => parseFloat(val));

// Смешение логики
const schema = z.object({
  amount: z.string().transform(/* трансформация */),
  // Бизнес-логика смешана с валидацией
  calculateTotal: (data) => { /* ... */ },
});
```

### 2. Сообщения об ошибках

#### ✅ Правильно
```typescript
// Понятные сообщения
.refine((val) => val > 0, 'Amount must be greater than 0')

// Локализованные сообщения
.refine((val) => val > 0, t('validation.positiveAmount'))

// Контекстные сообщения
.refine((val) => val <= maxAmount, `Amount cannot exceed ${maxAmount}`)
```

#### ❌ Неправильно
```typescript
// Технические сообщения
.refine((val) => val > 0, 'ERR_AMOUNT_POSITIVE')

// Неинформативные сообщения
.refine((val) => val > 0, 'Invalid')

// Жестко закодированные сообщения
.refine((val) => val > 0, 'Amount must be greater than 0')
```

## 🎨 UI/UX принципы

### 1. Пользовательский опыт

#### ✅ Правильно
```typescript
// Плавная валидация
validators: {
  onChange: formSchema,  // Валидация при изменении
}

// Информативная обратная связь
<InputNumberFormat
  {...field.getInputProps()}
  status={field.state.meta.error ? 'error' : 'default'}
  bottom={field.state.meta.error}
/>

// Состояние загрузки
<Button
  type="submit"
  disabled={!form.state.canSubmit}
  loading={form.state.isSubmitting}
>
  {t('calculate')}
</Button>
```

#### ❌ Неправильно
```typescript
// Валидация при каждом рендере
useEffect(() => {
  validateForm();
}, [form.state]);

// Отсутствие обратной связи
<InputNumberFormat {...field.getInputProps()} />

// Нет состояния загрузки
<Button type="submit">
  {t('calculate')}
</Button>
```

### 2. Доступность

#### ✅ Правильно
```typescript
// Семантическая разметка
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>{t('loanDetails')}</legend>
    <InputNumberFormat
      {...field.getInputProps()}
      aria-label={t('loanAmount')}
      aria-describedby={field.state.meta.error ? 'error' : undefined}
    />
  </fieldset>
</form>

// Клавиатурная навигация
<Button
  type="submit"
  onKeyDown={(e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  }}
>
  {t('calculate')}
</Button>
```

#### ❌ Неправильно
```typescript
// Отсутствие семантики
<div>
  <div>{t('loanDetails')}</div>
  <InputNumberFormat {...field.getInputProps()} />
</div>

// Нет поддержки клавиатуры
<Button type="submit">
  {t('calculate')}
</Button>
```

## ⚡ Производительность

### 1. Оптимизация рендеров

#### ✅ Правильно
```typescript
// Мемоизация компонентов
const LoanDetailsForm = memo(withForm({
  render: function Render({ form }) {
    // Логика рендеринга
  },
}));

// Селекторы состояния
<form.Subscribe
  selector={(state) => [state.canSubmit, state.isSubmitting]}
  children={([canSubmit, isSubmitting]) => (
    <Button disabled={!canSubmit} loading={isSubmitting}>
      Submit
    </Button>
  )}
/>

// Ленивая валидация
validators: {
  onChange: formSchema,  // Не при каждом рендере
}
```

#### ❌ Неправильно
```typescript
// Отсутствие мемоизации
const LoanDetailsForm = withForm({
  render: function Render({ form }) {
    // Логика рендеринга
  },
});

// Подписка на все изменения
<form.Subscribe
  children={(state) => (
    <Button disabled={!state.canSubmit}>
      Submit
    </Button>
  )}
/>

// Валидация при каждом рендере
useEffect(() => {
  validateForm();
}, [form.state]);
```

### 2. Оптимизация данных

#### ✅ Правильно
```typescript
// Мемоизация вычислений
const processedData = useMemo(() => 
  processFormData(form.state.values), 
  [form.state.values]
);

// Дебаунс для поиска
const debouncedSearch = useDebounce(searchTerm, 300);

// Ленивая загрузка
const LazyComponent = lazy(() => import('./HeavyComponent'));
```

#### ❌ Неправильно
```typescript
// Вычисления при каждом рендере
const processedData = processFormData(form.state.values);

// Нет дебаунса
useEffect(() => {
  search(searchTerm);
}, [searchTerm]);

// Синхронная загрузка
import HeavyComponent from './HeavyComponent';
```

## 🔧 Отладка и тестирование

### 1. Логирование

#### ✅ Правильно
```typescript
// Структурированное логирование
const logFormState = (state: FormState) => {
  console.group('Form State');
  console.log('Values:', state.values);
  console.log('Is Valid:', state.isValid);
  console.log('Can Submit:', state.canSubmit);
  console.log('Errors:', state.errors);
  console.groupEnd();
};

// Условное логирование
if (process.env.NODE_ENV === 'development') {
  form.state.subscribe(logFormState);
}
```

#### ❌ Неправильно
```typescript
// Неструктурированное логирование
console.log(form.state);

// Логирование в продакшене
console.log('Form state:', form.state);
```

### 2. Тестирование

#### ✅ Правильно
```typescript
// Unit тесты для схем
describe('loanDetailsSchema', () => {
  it('should validate correct data', () => {
    const validData = {
      loanAmount: '1000000',
      interestRate: '12.5',
      loanTerm: '30',
      startDate: '2024-01-01',
      paymentType: 'annuity',
      paymentDay: '15'
    };
    
    const result = loanDetailsSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});

// Интеграционные тесты
describe('LoanDetailsForm', () => {
  it('should submit valid form', async () => {
    render(<LoanDetailsForm />);
    
    fireEvent.change(screen.getByLabelText('Loan Amount'), {
      target: { value: '1000000' }
    });
    
    fireEvent.click(screen.getByText('Calculate'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        loanAmount: 1000000,
        // ...
      });
    });
  });
});
```

#### ❌ Неправильно
```typescript
// Отсутствие тестов
// Нет тестов для критической функциональности

// Неполные тесты
describe('Form', () => {
  it('should work', () => {
    // Тест без проверки результата
  });
});
```

## 🚀 Масштабирование

### 1. Добавление новых полей

#### ✅ Правильно
```typescript
// 1. Обновить схему
const extendedSchema = baseSchema.extend({
  newField: z.string().refine(/* валидация */),
});

// 2. Обновить типы
type ExtendedFormData = z.infer<typeof extendedSchema>;

// 3. Создать компонент
const NewField = ({ name, ...props }) => (
  <form.Field name={name}>
    {(field) => (
      <InputNumberFormat
        {...field.getInputProps()}
        field={field}
        {...props}
      />
    )}
  </form.Field>
);

// 4. Интегрировать в форму
<NewField name="newField" />
```

#### ❌ Неправильно
```typescript
// Прямое изменение существующей схемы
const schema = z.object({
  loanAmount: z.string(),
  newField: z.string(), // Добавлено в существующую схему
});

// Дублирование логики
const NewField = () => (
  <form.Field name="newField">
    {(field) => (
      <InputNumberFormat
        {...field.getInputProps()}
        field={field}
        inputMode="decimal"
        maximumFractionDigits={2}
        // Дублирование всех пропсов
      />
    )}
  </form.Field>
);
```

### 2. Добавление новых типов валидации

#### ✅ Правильно
```typescript
// Создание переиспользуемого валидатора
const createAmountValidator = (max: number) => 
  z.string()
    .transform((val) => parseFloat(unformat(val)))
    .refine((val) => val > 0, 'Must be positive')
    .refine((val) => val <= max, `Cannot exceed ${max}`);

// Использование в схемах
const loanAmountSchema = createAmountValidator(1000000000);
const earlyPaymentSchema = createAmountValidator(1000000);
```

#### ❌ Неправильно
```typescript
// Дублирование валидации
const loanAmountSchema = z.string()
  .transform((val) => parseFloat(unformat(val)))
  .refine((val) => val > 0, 'Must be positive')
  .refine((val) => val <= 1000000000, 'Cannot exceed 1000000000');

const earlyPaymentSchema = z.string()
  .transform((val) => parseFloat(unformat(val)))
  .refine((val) => val > 0, 'Must be positive')
  .refine((val) => val <= 1000000, 'Cannot exceed 1000000');
```

## 📚 Ресурсы и инструменты

### 1. Полезные библиотеки

```typescript
// @tanstack/react-form - управление формами
import { useForm } from '@tanstack/react-form';

// Zod - валидация
import { z } from 'zod';

// @react-input/number-format - форматирование чисел
import { InputNumberFormat } from '@react-input/number-format';

// use-debounce - дебаунс
import { useDebounce } from 'use-debounce';
```

### 2. Инструменты разработки

```typescript
// React DevTools Profiler
import { Profiler } from 'react';

// Логирование в DevTools
const logFormState = (state) => {
  console.group('Form State');
  console.table(state.values);
  console.log('Errors:', state.errors);
  console.groupEnd();
};
```

### 3. Документация

- [@tanstack/react-form](https://tanstack.com/form/latest/docs/framework/react)
- [Zod](https://zod.dev/)
- [Telegram UI](https://github.com/Telegram-Mini-Apps/TelegramUI)
- [React Hook Form](https://react-hook-form.com/)

## 🎯 Заключение

Следование этим лучшим практикам поможет создать:

- **Надежные формы** с правильной валидацией
- **Производительные компоненты** с оптимизированными рендерами
- **Поддерживаемый код** с четкой архитектурой
- **Отличный UX** с плавной работой форм
- **Масштабируемое решение** для будущих требований

Помните: лучшие практики - это не догма, а руководство. Адаптируйте их под конкретные потребности проекта и команды.
