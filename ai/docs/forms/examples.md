# Примеры использования форм

## Обзор

Практические примеры использования системы форм в Mortgage Calculator TMA, включая шаблоны, паттерны и решения типичных задач.

## 🚀 Быстрый старт

### Создание простой формы

```typescript
// 1. Создание схемы валидации
const simpleFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  age: z.string()
    .transform((val) => parseInt(val))
    .refine((val) => !isNaN(val), 'Must be a number')
    .refine((val) => val >= 18, 'Must be at least 18'),
});

// 2. Создание хука формы
const useSimpleForm = () => {
  return useAppForm({
    defaultValues: {
      name: '',
      email: '',
      age: '',
    },
    validators: {
      onChange: simpleFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value);
    },
  });
};

// 3. Создание компонента формы
const SimpleForm = () => {
  const form = useSimpleForm();

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="name">
        {(field) => (
          <Input
            {...field.getInputProps()}
            placeholder="Name"
            status={field.state.meta.error ? 'error' : 'default'}
            bottom={field.state.meta.error}
          />
        )}
      </form.Field>
      
      <form.Field name="email">
        {(field) => (
          <Input
            {...field.getInputProps()}
            placeholder="Email"
            type="email"
            status={field.state.meta.error ? 'error' : 'default'}
            bottom={field.state.meta.error}
          />
        )}
      </form.Field>
      
      <form.Field name="age">
        {(field) => (
          <InputNumberFormat
            {...field.getInputProps()}
            placeholder="Age"
            field={field}
            inputMode="numeric"
          />
        )}
      </form.Field>
      
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Submit
          </Button>
        )}
      />
    </form>
  );
};
```

## 📋 Шаблоны форм

### 1. Форма с массивом элементов

```typescript
// Схема для массива
const arrayItemSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Name is required'),
  amount: z.string()
    .transform((val) => parseFloat(unformat(val)))
    .refine((val) => !isNaN(val), 'Must be a number')
    .refine((val) => val > 0, 'Must be positive'),
});

const arrayFormSchema = z.object({
  items: z.array(arrayItemSchema),
});

// Компонент формы с массивом
const ArrayForm = () => {
  const form = useAppForm({
    defaultValues: {
      items: [],
    },
    validators: {
      onChange: arrayFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Array form submitted:', value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="items" mode="array">
        {(field) => (
          <div>
            {field.state.value.map((_, index) => (
              <div key={index} style={{ marginBottom: '16px' }}>
                <form.Field name={`items[${index}].name`}>
                  {(nameField) => (
                    <Input
                      {...nameField.getInputProps()}
                      placeholder="Item name"
                      status={nameField.state.meta.error ? 'error' : 'default'}
                      bottom={nameField.state.meta.error}
                    />
                  )}
                </form.Field>
                
                <form.Field name={`items[${index}].amount`}>
                  {(amountField) => (
                    <InputNumberFormat
                      {...amountField.getInputProps()}
                      placeholder="Amount"
                      field={amountField}
                      inputMode="decimal"
                    />
                  )}
                </form.Field>
                
                <Button
                  type="button"
                  onClick={() => field.removeValue(index)}
                  mode="outline"
                >
                  Remove
                </Button>
              </div>
            ))}
            
            <Button
              type="button"
              onClick={() => field.pushValue({
                id: Date.now().toString(),
                name: '',
                amount: '',
              })}
            >
              Add Item
            </Button>
          </div>
        )}
      </form.Field>
      
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Submit
          </Button>
        )}
      />
    </form>
  );
};
```

### 2. Форма с зависимыми полями

```typescript
// Схема с зависимыми полями
const dependentFormSchema = z.object({
  type: z.enum(['individual', 'company']),
  name: z.string().min(1, 'Name is required'),
  companyName: z.string().optional(),
  taxId: z.string().optional(),
}).refine((data) => {
  if (data.type === 'company') {
    return data.companyName && data.taxId;
  }
  return true;
}, {
  message: 'Company name and tax ID are required for company type',
  path: ['companyName'],
});

// Компонент с зависимыми полями
const DependentForm = () => {
  const form = useAppForm({
    defaultValues: {
      type: 'individual',
      name: '',
      companyName: '',
      taxId: '',
    },
    validators: {
      onChange: dependentFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Dependent form submitted:', value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="type">
        {(field) => (
          <Select
            {...field.getInputProps()}
            options={[
              { label: 'Individual', value: 'individual' },
              { label: 'Company', value: 'company' },
            ]}
          />
        )}
      </form.Field>
      
      <form.Field name="name">
        {(field) => (
          <Input
            {...field.getInputProps()}
            placeholder="Name"
            status={field.state.meta.error ? 'error' : 'default'}
            bottom={field.state.meta.error}
          />
        )}
      </form.Field>
      
      {/* Условные поля */}
      <form.Subscribe
        selector={(state) => [state.values.type]}
        children={([type]) => (
          <>
            {type === 'company' && (
              <>
                <form.Field name="companyName">
                  {(field) => (
                    <Input
                      {...field.getInputProps()}
                      placeholder="Company Name"
                      status={field.state.meta.error ? 'error' : 'default'}
                      bottom={field.state.meta.error}
                    />
                  )}
                </form.Field>
                
                <form.Field name="taxId">
                  {(field) => (
                    <Input
                      {...field.getInputProps()}
                      placeholder="Tax ID"
                      status={field.state.meta.error ? 'error' : 'default'}
                      bottom={field.state.meta.error}
                    />
                  )}
                </form.Field>
              </>
            )}
          </>
        )}
      />
      
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Submit
          </Button>
        )}
      />
    </form>
  );
};
```

### 3. Форма с асинхронной валидацией

```typescript
// Схема с асинхронной валидацией
const asyncFormSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  email: z.string().email('Invalid email'),
}).refine(async (data) => {
  // Проверка уникальности username
  const response = await fetch(`/api/check-username/${data.username}`);
  return response.ok;
}, {
  message: 'Username is already taken',
  path: ['username'],
});

// Компонент с асинхронной валидацией
const AsyncForm = () => {
  const form = useAppForm({
    defaultValues: {
      username: '',
      email: '',
    },
    validators: {
      onChangeAsync: asyncFormSchema,
    },
    onSubmit: async ({ value }) => {
      console.log('Async form submitted:', value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="username">
        {(field) => (
          <div>
            <Input
              {...field.getInputProps()}
              placeholder="Username"
              status={field.state.meta.error ? 'error' : 'default'}
              bottom={field.state.meta.error}
            />
            {field.state.meta.isValidating && (
              <div>Checking username availability...</div>
            )}
          </div>
        )}
      </form.Field>
      
      <form.Field name="email">
        {(field) => (
          <Input
            {...field.getInputProps()}
            placeholder="Email"
            type="email"
            status={field.state.meta.error ? 'error' : 'default'}
            bottom={field.state.meta.error}
          />
        )}
      </form.Field>
      
      <form.Subscribe
        selector={(state) => [state.canSubmit, state.isSubmitting]}
        children={([canSubmit, isSubmitting]) => (
          <Button
            type="submit"
            disabled={!canSubmit}
            loading={isSubmitting}
          >
            Submit
          </Button>
        )}
      />
    </form>
  );
};
```

## 🔧 Паттерны разработки

### 1. Переиспользуемые компоненты полей

```typescript
// Базовый компонент поля
interface FieldProps {
  name: string;
  label: string;
  placeholder?: string;
  type?: string;
  validation?: ZodSchema;
}

const FormField: FC<FieldProps> = ({ 
  name, 
  label, 
  placeholder, 
  type = 'text',
  validation 
}) => {
  return (
    <form.Field name={name} validators={validation ? { onChange: validation } : undefined}>
      {(field) => (
        <Input
          {...field.getInputProps()}
          header={label}
          placeholder={placeholder}
          type={type}
          status={field.state.meta.error ? 'error' : 'default'}
          bottom={field.state.meta.error}
        />
      )}
    </form.Field>
  );
};

// Специализированные компоненты
const NumberField: FC<Omit<FieldProps, 'type'>> = (props) => (
  <form.Field name={props.name}>
    {(field) => (
      <InputNumberFormat
        {...field.getInputProps()}
        header={props.label}
        placeholder={props.placeholder}
        field={field}
        inputMode="decimal"
      />
    )}
  </form.Field>
);

const SelectField: FC<FieldProps & { options: Array<{label: string, value: string}> }> = ({ 
  options, 
  ...props 
}) => (
  <form.Field name={props.name}>
    {(field) => (
      <Select
        {...field.getInputProps()}
        header={props.label}
        options={options}
        status={field.state.meta.error ? 'error' : 'default'}
        bottom={field.state.meta.error}
      />
    )}
  </form.Field>
);

// Использование
const MyForm = () => {
  return (
    <form>
      <FormField
        name="name"
        label="Name"
        placeholder="Enter your name"
        validation={z.string().min(1, 'Name is required')}
      />
      
      <NumberField
        name="amount"
        label="Amount"
        placeholder="Enter amount"
      />
      
      <SelectField
        name="type"
        label="Type"
        options={[
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
        ]}
      />
    </form>
  );
};
```

### 2. Хуки для работы с формами

```typescript
// Хук для работы с массивами
const useArrayField = (name: string) => {
  const form = useFormContext();
  
  const addItem = (item: any) => {
    form.setFieldValue(name, (old) => [...old, item]);
  };
  
  const removeItem = (index: number) => {
    form.setFieldValue(name, (old) => old.filter((_, i) => i !== index));
  };
  
  const updateItem = (index: number, item: any) => {
    form.setFieldValue(name, (old) => 
      old.map((existing, i) => i === index ? item : existing)
    );
  };
  
  return { addItem, removeItem, updateItem };
};

// Хук для валидации
const useValidation = (schema: ZodSchema) => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const validate = (data: any) => {
    const result = schema.safeParse(data);
    
    if (result.success) {
      setErrors({});
      return true;
    } else {
      const newErrors: Record<string, string> = {};
      result.error.issues.forEach(issue => {
        const path = issue.path.join('.');
        newErrors[path] = issue.message;
      });
      setErrors(newErrors);
      return false;
    }
  };
  
  return { errors, validate };
};

// Использование хуков
const MyForm = () => {
  const form = useAppForm({...});
  const { addItem, removeItem } = useArrayField('items');
  const { errors, validate } = useValidation(mySchema);
  
  const handleAddItem = () => {
    addItem({ id: Date.now().toString(), name: '', amount: '' });
  };
  
  const handleRemoveItem = (index: number) => {
    removeItem(index);
  };
  
  return (
    <form>
      {/* Использование хуков */}
    </form>
  );
};
```

### 3. Обработка ошибок

```typescript
// Компонент для отображения ошибок
const ErrorDisplay: FC<{ error: string | undefined }> = ({ error }) => {
  if (!error) return null;
  
  return (
    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>
      {error}
    </div>
  );
};

// Компонент с обработкой ошибок
const FormWithErrorHandling = () => {
  const form = useAppForm({
    defaultValues: { name: '', email: '' },
    validators: { onChange: mySchema },
    onSubmit: async ({ value }) => {
      try {
        await submitForm(value);
      } catch (error) {
        console.error('Form submission error:', error);
        // Показать пользователю ошибку
      }
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="name">
        {(field) => (
          <div>
            <Input
              {...field.getInputProps()}
              placeholder="Name"
              status={field.state.meta.error ? 'error' : 'default'}
            />
            <ErrorDisplay error={field.state.meta.error} />
          </div>
        )}
      </form.Field>
      
      {/* Глобальные ошибки формы */}
      <form.Subscribe
        selector={(state) => [state.errors]}
        children={([errors]) => (
          <div>
            {Object.entries(errors).map(([key, error]) => (
              <div key={key} style={{ color: 'red' }}>
                {error}
              </div>
            ))}
          </div>
        )}
      />
    </form>
  );
};
```

## 🐛 Troubleshooting

### 1. Частые проблемы

#### Проблема: Форма не отправляется
```typescript
// ❌ Неправильно
const MyForm = () => {
  const form = useAppForm({...});
  
  return (
    <div>
      <form.Field name="name">
        {(field) => <Input {...field.getInputProps()} />}
      </form.Field>
      <Button onClick={() => form.handleSubmit()}>Submit</Button>
    </div>
  );
};

// ✅ Правильно
const MyForm = () => {
  const form = useAppForm({...});
  
  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.Field name="name">
        {(field) => <Input {...field.getInputProps()} />}
      </form.Field>
      <Button type="submit">Submit</Button>
    </form>
  );
};
```

#### Проблема: Валидация не работает
```typescript
// ❌ Неправильно
const form = useAppForm({
  defaultValues: { name: '' },
  // Нет валидаторов
});

// ✅ Правильно
const form = useAppForm({
  defaultValues: { name: '' },
  validators: {
    onChange: z.object({
      name: z.string().min(1, 'Name is required'),
    }),
  },
});
```

#### Проблема: Ошибки не отображаются
```typescript
// ❌ Неправильно
<form.Field name="name">
  {(field) => <Input {...field.getInputProps()} />}
</form.Field>

// ✅ Правильно
<form.Field name="name">
  {(field) => (
    <Input
      {...field.getInputProps()}
      status={field.state.meta.error ? 'error' : 'default'}
      bottom={field.state.meta.error}
    />
  )}
</form.Field>
```

### 2. Отладка

```typescript
// Логирование состояния формы
const DebugForm = () => {
  const form = useAppForm({...});
  
  useEffect(() => {
    const unsubscribe = form.state.subscribe((state) => {
      console.log('Form state:', {
        values: state.values,
        isValid: state.isValid,
        canSubmit: state.canSubmit,
        errors: state.errors,
      });
    });
    
    return unsubscribe;
  }, [form]);
  
  return (
    <form>
      {/* Поля формы */}
    </form>
  );
};

// Логирование состояния поля
const DebugField = ({ name }: { name: string }) => {
  return (
    <form.Field name={name}>
      {(field) => {
        useEffect(() => {
          const unsubscribe = field.state.subscribe((state) => {
            console.log(`Field ${name} state:`, {
              value: state.value,
              error: state.meta.error,
              isDirty: state.meta.isDirty,
              isTouched: state.meta.isTouched,
            });
          });
          
          return unsubscribe;
        }, [field]);
        
        return (
          <Input
            {...field.getInputProps()}
            status={field.state.meta.error ? 'error' : 'default'}
            bottom={field.state.meta.error}
          />
        );
      }}
    </form.Field>
  );
};
```

## 📚 Дополнительные ресурсы

### 1. Полезные утилиты

```typescript
// Утилита для форматирования чисел
export const formatCurrency = (value: number, locale = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

// Утилита для валидации email
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Утилита для дебаунса
export const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  
  return debouncedValue;
};
```

### 2. Тестирование

```typescript
// Тест компонента формы
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MyForm } from './MyForm';

describe('MyForm', () => {
  it('should submit valid form', async () => {
    const mockOnSubmit = jest.fn();
    render(<MyForm onSubmit={mockOnSubmit} />);
    
    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'John Doe' }
    });
    
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });
  
  it('should show validation errors', async () => {
    render(<MyForm />);
    
    fireEvent.click(screen.getByText('Submit'));
    
    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
    });
  });
});
```

### 3. Производительность

```typescript
// Оптимизация с мемоизацией
const OptimizedForm = memo(() => {
  const form = useAppForm({...});
  
  const handleSubmit = useCallback((data) => {
    // Обработка отправки
  }, []);
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Поля формы */}
    </form>
  );
});

// Оптимизация с селекторами
const OptimizedButton = () => {
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting]}
      children={([canSubmit, isSubmitting]) => (
        <Button
          type="submit"
          disabled={!canSubmit}
          loading={isSubmitting}
        >
          Submit
        </Button>
      )}
    />
  );
};
```

---

**Помните**: Эти примеры - отправная точка. Адаптируйте их под свои потребности и следуйте лучшим практикам для создания надежных и производительных форм.
