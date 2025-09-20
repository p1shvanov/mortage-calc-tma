# @tanstack/react-form@1.23.0 Cheatsheet

## Обзор

Современная библиотека для управления формами в React с фокусом на производительность и гибкость. Предоставляет декларативный API для создания сложных форм с валидацией.

**Документация**: https://tanstack.com/form/latest/docs/framework/react

## Установка

```bash
npm install @tanstack/react-form
# или
pnpm add @tanstack/react-form
# или
yarn add @tanstack/react-form
```

## Базовое использование

### Простая форма

```tsx
import { useForm } from '@tanstack/react-form';

function SimpleForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
    onSubmit: async ({ value }) => {
      console.log('Form submitted:', value);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <div>
        <input
          {...form.getFieldProps('email')}
          type="email"
          placeholder="Email"
        />
        {form.state.fieldMeta.email?.error && (
          <div>{form.state.fieldMeta.email.error}</div>
        )}
      </div>
      
      <div>
        <input
          {...form.getFieldProps('password')}
          type="password"
          placeholder="Password"
        />
        {form.state.fieldMeta.password?.error && (
          <div>{form.state.fieldMeta.password.error}</div>
        )}
      </div>
      
      <button type="submit" disabled={!form.state.canSubmit}>
        Submit
      </button>
    </form>
  );
}
```

## Валидация

### Валидация на уровне поля

```tsx
import { useForm } from '@tanstack/react-form';

function ValidatedForm() {
  const form = useForm({
    defaultValues: {
      email: '',
      age: 0,
    },
    validators: {
      onChange: ({ value }) => {
        const errors: Record<string, string> = {};
        
        if (!value.email) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(value.email)) {
          errors.email = 'Email is invalid';
        }
        
        if (value.age < 18) {
          errors.age = 'Must be at least 18 years old';
        }
        
        return Object.keys(errors).length > 0 ? errors : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      console.log('Valid form:', value);
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <div>
        <input
          {...form.getFieldProps('email')}
          type="email"
          placeholder="Email"
        />
        {form.state.fieldMeta.email?.error && (
          <div style={{ color: 'red' }}>{form.state.fieldMeta.email.error}</div>
        )}
      </div>
      
      <div>
        <input
          {...form.getFieldProps('age')}
          type="number"
          placeholder="Age"
        />
        {form.state.fieldMeta.age?.error && (
          <div style={{ color: 'red' }}>{form.state.fieldMeta.age.error}</div>
        )}
      </div>
      
      <button type="submit" disabled={!form.state.canSubmit}>
        Submit
      </button>
    </form>
  );
}
```

### Асинхронная валидация

```tsx
import { useForm } from '@tanstack/react-form';

function AsyncValidationForm() {
  const form = useForm({
    defaultValues: {
      username: '',
    },
    validators: {
      onChangeAsync: async ({ value }) => {
        if (!value.username) return undefined;
        
        // Имитация API запроса
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        if (value.username === 'admin') {
          return { username: 'Username is already taken' };
        }
        
        return undefined;
      },
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <div>
        <input
          {...form.getFieldProps('username')}
          placeholder="Username"
        />
        {form.state.fieldMeta.username?.error && (
          <div style={{ color: 'red' }}>{form.state.fieldMeta.username.error}</div>
        )}
        {form.state.fieldMeta.username?.isValidating && (
          <div>Checking username...</div>
        )}
      </div>
      
      <button type="submit" disabled={!form.state.canSubmit}>
        Submit
      </button>
    </form>
  );
}
```

## Управление состоянием

### Подписка на изменения

```tsx
import { useForm } from '@tanstack/react-form';

function StatefulForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
  });

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
        <input
          {...form.getFieldProps('name')}
          placeholder="Name"
        />
        <input
          {...form.getFieldProps('email')}
          placeholder="Email"
        />
        <button type="submit">Submit</button>
      </form>
      
      {/* Отображение состояния формы */}
      <div>
        <h3>Form State:</h3>
        <p>Can Submit: {form.state.canSubmit ? 'Yes' : 'No'}</p>
        <p>Is Submitting: {form.state.isSubmitting ? 'Yes' : 'No'}</p>
        <p>Is Valid: {form.state.isValid ? 'Yes' : 'No'}</p>
        <p>Values: {JSON.stringify(form.state.values)}</p>
      </div>
    </div>
  );
}
```

### Сброс формы

```tsx
import { useForm } from '@tanstack/react-form';

function ResettableForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    onSubmit: async ({ value }) => {
      console.log('Submitted:', value);
      form.reset(); // Сброс формы после отправки
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <input
        {...form.getFieldProps('name')}
        placeholder="Name"
      />
      <input
        {...form.getFieldProps('email')}
        placeholder="Email"
      />
      <button type="submit">Submit</button>
      <button type="button" onClick={() => form.reset()}>
        Reset
      </button>
    </form>
  );
}
```

## Работа с массивами

### Динамические поля

```tsx
import { useForm } from '@tanstack/react-form';

function DynamicFieldsForm() {
  const form = useForm({
    defaultValues: {
      items: [{ name: '', value: '' }],
    },
    onSubmit: async ({ value }) => {
      console.log('Items:', value.items);
    },
  });

  const addItem = () => {
    form.setFieldValue('items', (old) => [...old, { name: '', value: '' }]);
  };

  const removeItem = (index: number) => {
    form.setFieldValue('items', (old) => old.filter((_, i) => i !== index));
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      {form.state.values.items.map((_, index) => (
        <div key={index}>
          <input
            {...form.getFieldProps(`items.${index}.name`)}
            placeholder="Item name"
          />
          <input
            {...form.getFieldProps(`items.${index}.value`)}
            placeholder="Item value"
          />
          <button type="button" onClick={() => removeItem(index)}>
            Remove
          </button>
        </div>
      ))}
      
      <button type="button" onClick={addItem}>
        Add Item
      </button>
      <button type="submit">Submit</button>
    </form>
  );
}
```

## Интеграция с UI библиотеками

### С Telegram UI

```tsx
import { useForm } from '@tanstack/react-form';
import { Button, Input, List, Cell } from '@telegram-apps/telegram-ui';

function TelegramForm() {
  const form = useForm({
    defaultValues: {
      name: '',
      email: '',
    },
    validators: {
      onChange: ({ value }) => {
        const errors: Record<string, string> = {};
        if (!value.name) errors.name = 'Name is required';
        if (!value.email) errors.email = 'Email is required';
        return Object.keys(errors).length > 0 ? errors : undefined;
      },
    },
    onSubmit: async ({ value }) => {
      console.log('Submitted:', value);
    },
  });

  return (
    <List>
      <Cell>
        <Input
          {...form.getFieldProps('name')}
          placeholder="Name"
          status={form.state.fieldMeta.name?.error ? 'error' : 'default'}
          bottom={form.state.fieldMeta.name?.error}
        />
      </Cell>
      
      <Cell>
        <Input
          {...form.getFieldProps('email')}
          placeholder="Email"
          status={form.state.fieldMeta.email?.error ? 'error' : 'default'}
          bottom={form.state.fieldMeta.email?.error}
        />
      </Cell>
      
      <Cell>
        <Button
          size="m"
          stretched
          onClick={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
          disabled={!form.state.canSubmit}
        >
          Submit
        </Button>
      </Cell>
    </List>
  );
}
```

## Продвинутые паттерны

### Форма с зависимыми полями

```tsx
import { useForm } from '@tanstack/react-form';

function DependentFieldsForm() {
  const form = useForm({
    defaultValues: {
      type: 'individual',
      companyName: '',
      taxId: '',
    },
    validators: {
      onChange: ({ value }) => {
        const errors: Record<string, string> = {};
        
        if (value.type === 'company') {
          if (!value.companyName) {
            errors.companyName = 'Company name is required';
          }
          if (!value.taxId) {
            errors.taxId = 'Tax ID is required';
          }
        }
        
        return Object.keys(errors).length > 0 ? errors : undefined;
      },
    },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <div>
        <label>
          <input
            type="radio"
            {...form.getFieldProps('type')}
            value="individual"
          />
          Individual
        </label>
        <label>
          <input
            type="radio"
            {...form.getFieldProps('type')}
            value="company"
          />
          Company
        </label>
      </div>
      
      {form.state.values.type === 'company' && (
        <>
          <div>
            <input
              {...form.getFieldProps('companyName')}
              placeholder="Company Name"
            />
            {form.state.fieldMeta.companyName?.error && (
              <div style={{ color: 'red' }}>{form.state.fieldMeta.companyName.error}</div>
            )}
          </div>
          
          <div>
            <input
              {...form.getFieldProps('taxId')}
              placeholder="Tax ID"
            />
            {form.state.fieldMeta.taxId?.error && (
              <div style={{ color: 'red' }}>{form.state.fieldMeta.taxId.error}</div>
            )}
          </div>
        </>
      )}
      
      <button type="submit" disabled={!form.state.canSubmit}>
        Submit
      </button>
    </form>
  );
}
```

### Форма с debounce

```tsx
import { useForm } from '@tanstack/react-form';
import { useDebounce } from 'use-debounce';

function DebouncedForm() {
  const form = useForm({
    defaultValues: {
      search: '',
    },
  });

  const [debouncedSearch] = useDebounce(form.state.values.search, 500);

  // Эффект для поиска с debounce
  useEffect(() => {
    if (debouncedSearch) {
      // Выполнить поиск
      console.log('Searching for:', debouncedSearch);
    }
  }, [debouncedSearch]);

  return (
    <form>
      <input
        {...form.getFieldProps('search')}
        placeholder="Search..."
      />
    </form>
  );
}
```

## Best Practices

1. **Используйте валидацию**: Всегда валидируйте данные формы
2. **Обработка ошибок**: Предоставляйте понятные сообщения об ошибках
3. **Производительность**: Используйте debounce для поиска и валидации
4. **Доступность**: Обеспечивайте доступность форм для всех пользователей
5. **Типизация**: Используйте TypeScript для типизации данных форм

## Полезные ссылки

- [Официальная документация](https://tanstack.com/form/latest/docs/framework/react)
- [Примеры использования](https://tanstack.com/form/latest/docs/framework/react/examples)
- [API Reference](https://tanstack.com/form/latest/docs/framework/react/api)
