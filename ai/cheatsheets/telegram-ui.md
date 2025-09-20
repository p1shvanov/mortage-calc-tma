# @telegram-apps/telegram-ui@2.1.9 Cheatsheet

## Обзор

React компоненты библиотека для Telegram Mini Apps, вдохновленная интерфейсом Telegram. Предоставляет готовые UI компоненты в стиле Telegram.

**Документация**: https://github.com/Telegram-Mini-Apps/TelegramUI

## Установка

```bash
npm install @telegram-apps/telegram-ui
# или
pnpm add @telegram-apps/telegram-ui
# или
yarn add @telegram-apps/telegram-ui
```

## Основные компоненты

### AppRoot

Корневой компонент приложения с поддержкой темизации.

```tsx
import { AppRoot } from '@telegram-apps/telegram-ui';

function App() {
  return (
    <AppRoot
      appearance="light" // или "dark"
      platform="ios" // или "base"
    >
      <YourAppContent />
    </AppRoot>
  );
}
```

### Button

Кнопки в стиле Telegram.

```tsx
import { Button } from '@telegram-apps/telegram-ui';

function ButtonExamples() {
  return (
    <div>
      {/* Основная кнопка */}
      <Button size="m" stretched>
        Primary Button
      </Button>

      {/* Вторичная кнопка */}
      <Button mode="secondary" size="m">
        Secondary Button
      </Button>

      {/* Кнопка с иконкой */}
      <Button before={<Icon />} size="m">
        With Icon
      </Button>

      {/* Кнопка загрузки */}
      <Button loading size="m">
        Loading...
      </Button>

      {/* Отключенная кнопка */}
      <Button disabled size="m">
        Disabled
      </Button>
    </div>
  );
}
```

### Input

Поля ввода в стиле Telegram.

```tsx
import { Input } from '@telegram-apps/telegram-ui';

function InputExamples() {
  return (
    <div>
      {/* Обычное поле ввода */}
      <Input
        placeholder="Enter text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />

      {/* Поле с иконкой */}
      <Input
        before={<SearchIcon />}
        placeholder="Search"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Поле с кнопкой */}
      <Input
        after={<Button size="s">Send</Button>}
        placeholder="Message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Поле с ошибкой */}
      <Input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        status="error"
        bottom={errorMessage}
      />
    </div>
  );
}
```

### List

Список элементов в стиле Telegram.

```tsx
import { List, Cell, Text, Icon } from '@telegram-apps/telegram-ui';

function ListExamples() {
  return (
    <List>
      {/* Простая ячейка */}
      <Cell>
        <Text>Simple cell</Text>
      </Cell>

      {/* Ячейка с иконкой */}
      <Cell before={<Icon />}>
        <Text>Cell with icon</Text>
      </Cell>

      {/* Ячейка с кнопкой */}
      <Cell after={<Button size="s">Action</Button>}>
        <Text>Cell with button</Text>
      </Cell>

      {/* Ячейка с переключателем */}
      <Cell after={<Switch checked={enabled} onChange={setEnabled} />}>
        <Text>Toggle setting</Text>
      </Cell>

      {/* Ячейка с описанием */}
      <Cell>
        <Text>Title</Text>
        <Text tone="secondary">Description text</Text>
      </Cell>
    </List>
  );
}
```

### Switch

Переключатель в стиле Telegram.

```tsx
import { Switch } from '@telegram-apps/telegram-ui';

function SwitchExample() {
  const [enabled, setEnabled] = useState(false);

  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      disabled={false}
    />
  );
}
```

### Placeholder

Заглушка для пустых состояний.

```tsx
import { Placeholder } from '@telegram-apps/telegram-ui';

function PlaceholderExample() {
  return (
    <Placeholder
      icon={<EmptyIcon />}
      header="No data"
      description="There is no data to display"
    >
      <Button size="m">Refresh</Button>
    </Placeholder>
  );
}
```

### Modal

Модальные окна.

```tsx
import { Modal, ModalRoot, ModalPage } from '@telegram-apps/telegram-ui';

function ModalExample() {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  return (
    <ModalRoot activeModal={activeModal} onClose={() => setActiveModal(null)}>
      <ModalPage id="example">
        <div>
          <Text>Modal content</Text>
          <Button onClick={() => setActiveModal(null)}>
            Close
          </Button>
        </div>
      </ModalPage>
    </ModalRoot>
  );
}
```

### Tabs

Вкладки в стиле Telegram.

```tsx
import { Tabs, TabsItem } from '@telegram-apps/telegram-ui';

function TabsExample() {
  const [activeTab, setActiveTab] = useState('tab1');

  return (
    <Tabs>
      <TabsItem
        selected={activeTab === 'tab1'}
        onClick={() => setActiveTab('tab1')}
      >
        Tab 1
      </TabsItem>
      <TabsItem
        selected={activeTab === 'tab2'}
        onClick={() => setActiveTab('tab2')}
      >
        Tab 2
      </TabsItem>
    </Tabs>
  );
}
```

### Text

Текстовые элементы с поддержкой тонов.

```tsx
import { Text } from '@telegram-apps/telegram-ui';

function TextExamples() {
  return (
    <div>
      {/* Основной текст */}
      <Text>Regular text</Text>

      {/* Заголовок */}
      <Text weight="2">Bold text</Text>

      {/* Вторичный текст */}
      <Text tone="secondary">Secondary text</Text>

      {/* Текст с переносами */}
      <Text wrap>Long text that wraps to multiple lines</Text>

      {/* Текст с выравниванием */}
      <Text align="center">Centered text</Text>
    </div>
  );
}
```

### Icon

Иконки в стиле Telegram.

```tsx
import { Icon } from '@telegram-apps/telegram-ui';

function IconExamples() {
  return (
    <div>
      {/* Иконка по умолчанию */}
      <Icon />

      {/* Иконка с размером */}
      <Icon size={24} />

      {/* Иконка с цветом */}
      <Icon color="var(--tg-theme-accent-text-color)" />
    </div>
  );
}
```

## Композиция компонентов

### Форма с валидацией

```tsx
import { 
  AppRoot, 
  List, 
  Cell, 
  Input, 
  Button, 
  Text 
} from '@telegram-apps/telegram-ui';

function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!name) newErrors.name = 'Name is required';
    if (!email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      // Отправка формы
      console.log({ name, email });
    }
  };

  return (
    <AppRoot>
      <List>
        <Cell>
          <Input
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            status={errors.name ? 'error' : 'default'}
            bottom={errors.name}
          />
        </Cell>
        <Cell>
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            status={errors.email ? 'error' : 'default'}
            bottom={errors.email}
          />
        </Cell>
        <Cell>
          <Button size="m" stretched onClick={handleSubmit}>
            Submit
          </Button>
        </Cell>
      </List>
    </AppRoot>
  );
}
```

### Настройки приложения

```tsx
import { 
  AppRoot, 
  List, 
  Cell, 
  Text, 
  Switch, 
  Button 
} from '@telegram-apps/telegram-ui';

function Settings() {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  return (
    <AppRoot appearance={darkMode ? 'dark' : 'light'}>
      <List>
        <Cell>
          <Text>Notifications</Text>
          <Switch 
            checked={notifications} 
            onChange={setNotifications} 
          />
        </Cell>
        <Cell>
          <Text>Dark Mode</Text>
          <Switch 
            checked={darkMode} 
            onChange={setDarkMode} 
          />
        </Cell>
        <Cell>
          <Button mode="secondary" size="m">
            Clear Cache
          </Button>
        </Cell>
      </List>
    </AppRoot>
  );
}
```

## Темизация

### CSS переменные

```css
:root {
  --tg-theme-bg-color: #ffffff;
  --tg-theme-text-color: #000000;
  --tg-theme-hint-color: #999999;
  --tg-theme-link-color: #2481cc;
  --tg-theme-button-color: #2481cc;
  --tg-theme-button-text-color: #ffffff;
  --tg-theme-secondary-bg-color: #f1f1f1;
}
```

### Динамическая темизация

```tsx
import { useEffect } from 'react';
import { themeParams } from '@telegram-apps/sdk-react';

function ThemedApp() {
  useEffect(() => {
    const updateTheme = (theme) => {
      document.documentElement.style.setProperty(
        '--tg-theme-bg-color', 
        theme.bg_color
      );
      document.documentElement.style.setProperty(
        '--tg-theme-text-color', 
        theme.text_color
      );
    };

    themeParams.on('change', updateTheme);
    updateTheme(themeParams);

    return () => {
      themeParams.off('change', updateTheme);
    };
  }, []);

  return <YourAppContent />;
}
```

## Адаптивность

### Responsive компоненты

```tsx
import { useSignal } from '@telegram-apps/sdk-react';
import { viewport } from '@telegram-apps/sdk-react';

function ResponsiveComponent() {
  const height = useSignal(viewport.height);
  const isExpanded = useSignal(viewport.isExpanded);

  return (
    <div style={{
      height: isExpanded ? '100vh' : `${height}px`,
      transition: 'height 0.3s ease'
    }}>
      <Text>Responsive content</Text>
    </div>
  );
}
```

## Best Practices

1. **Используйте AppRoot**: Всегда оборачивайте приложение в AppRoot
2. **Темизация**: Используйте CSS переменные для темизации
3. **Адаптивность**: Учитывайте размеры viewport
4. **Консистентность**: Используйте компоненты библиотеки для единообразия
5. **Доступность**: Следуйте принципам доступности Telegram

## Полезные ссылки

- [GitHub репозиторий](https://github.com/Telegram-Mini-Apps/TelegramUI)
- [Примеры использования](https://github.com/Telegram-Mini-Apps/TelegramUI/tree/main/examples)
- [Telegram Mini Apps документация](https://core.telegram.org/bots/webapps)
