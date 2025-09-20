# @telegram-apps/sdk-react@3.3.7 Cheatsheet

## Обзор

React.js пакет для работы с Telegram Mini Apps SDK. Предоставляет хуки и утилиты для интеграции с Telegram Mini Apps функциональностью.

**Документация**: https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x

## Установка

```bash
npm install @telegram-apps/sdk-react
# или
pnpm add @telegram-apps/sdk-react
# или
yarn add @telegram-apps/sdk-react
```

## Инициализация

### Базовая инициализация

```tsx
import { init } from '@telegram-apps/sdk-react';

// Инициализация пакета
init();
```

### Полный пример инициализации

```tsx
import ReactDOM from 'react-dom/client';
import { init, backButton } from '@telegram-apps/sdk-react';

// Инициализация
init();

// Монтирование компонентов
backButton.mount();

ReactDOM
  .createRoot(document.getElementById('root')!)
  .render(<App />);
```

## Основные Hooks

### useLaunchParams

Получает параметры запуска приложения.

```tsx
import { useLaunchParams } from '@telegram-apps/sdk-react';

function Component() {
  const launchParams = useLaunchParams();
  
  console.log(launchParams);
  // {
  //   tgWebAppBotInline: false,
  //   tgWebAppData: {
  //     user: { ... },
  //     auth_date: Date(...),
  //     query_id: ...,
  //     hash: ...
  //   },
  //   ...
  // };

  return <div>Launch params loaded</div>;
}
```

### useRawLaunchParams

Возвращает параметры запуска в сыром формате.

```tsx
import { useRawLaunchParams } from '@telegram-apps/sdk-react';

function Component() {
  const rawParams = useRawLaunchParams();
  
  console.log(rawParams);
  // "tgWebAppBotInline=0&tgWebAppData=%7B%22user%22%3A%7B%7D..."

  return <div>Raw params: {rawParams}</div>;
}
```

### useRawInitData

Получает init data в исходном формате.

```tsx
import { useRawInitData } from '@telegram-apps/sdk-react';

function Component() {
  const initData = useRawInitData();
  
  console.log(initData);
  // '{"user":...,"auth_date":...,"query_id":...,...}'

  return <div>Init data: {initData}</div>;
}
```

### useSignal

Хук для работы с сигналами SDK.

```tsx
import { useEffect } from 'react';
import { backButton, useSignal } from '@telegram-apps/sdk-react';

function BackButtonComponent() {
  const isVisible = useSignal(backButton.isVisible);

  useEffect(() => {
    console.log('Button is', isVisible ? 'visible' : 'invisible');
  }, [isVisible]);

  useEffect(() => {
    backButton.show();
    return () => {
      backButton.hide();
    };
  }, []);

  return null;
}
```

### useAndroidDeviceData

Получает данные об Android устройстве.

```tsx
import { useAndroidDeviceData } from '@telegram-apps/sdk-react';

function DeviceInfo() {
  const deviceData = useAndroidDeviceData();
  
  // {
  //   manufacturer: 'Samsung',
  //   performanceClass: 'AVERAGE',
  //   model: 'SM-A155F',
  //   androidVersion: '14',
  //   sdkVersion: 34,
  // }

  return (
    <div>
      <p>Manufacturer: {deviceData.manufacturer}</p>
      <p>Model: {deviceData.model}</p>
      <p>Android: {deviceData.androidVersion}</p>
    </div>
  );
}
```

## Компоненты SDK

### Back Button

```tsx
import { useEffect } from 'react';
import { backButton, useSignal } from '@telegram-apps/sdk-react';

function BackButton() {
  const isVisible = useSignal(backButton.isVisible);

  useEffect(() => {
    // Показать кнопку назад
    backButton.show();
    
    // Обработчик клика
    const off = backButton.onClick(() => {
      window.history.back();
    });

    return () => {
      backButton.hide();
      off();
    };
  }, []);

  return null;
}
```

### Main Button

```tsx
import { useEffect } from 'react';
import { mainButton, useSignal } from '@telegram-apps/sdk-react';

function MainButton() {
  const isVisible = useSignal(mainButton.isVisible);
  const isActive = useSignal(mainButton.isActive);
  const text = useSignal(mainButton.text);

  useEffect(() => {
    // Настройка кнопки
    mainButton.setText('Submit');
    mainButton.show();
    mainButton.enable();

    // Обработчик клика
    const off = mainButton.onClick(() => {
      console.log('Main button clicked');
    });

    return () => {
      mainButton.hide();
      off();
    };
  }, []);

  return null;
}
```

### Theme Params

```tsx
import { useEffect } from 'react';
import { themeParams, useSignal } from '@telegram-apps/sdk-react';

function ThemeComponent() {
  const theme = useSignal(themeParams);

  useEffect(() => {
    console.log('Theme params:', theme);
  }, [theme]);

  return (
    <div style={{ 
      backgroundColor: theme.bg_color,
      color: theme.text_color 
    }}>
      Themed content
    </div>
  );
}
```

### Viewport

```tsx
import { useEffect } from 'react';
import { viewport, useSignal } from '@telegram-apps/sdk-react';

function ViewportInfo() {
  const height = useSignal(viewport.height);
  const isExpanded = useSignal(viewport.isExpanded);

  useEffect(() => {
    console.log('Viewport height:', height);
    console.log('Is expanded:', isExpanded);
  }, [height, isExpanded]);

  return (
    <div>
      <p>Height: {height}px</p>
      <p>Expanded: {isExpanded ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

## Паттерны использования

### Инициализация приложения

```tsx
import { init, backButton, mainButton, themeParams } from '@telegram-apps/sdk-react';

// Инициализация
init();

// Монтирование компонентов
backButton.mount();
mainButton.mount();
themeParams.mount();

// Настройка темы
themeParams.on('change', (theme) => {
  document.documentElement.style.setProperty('--tg-theme-bg-color', theme.bg_color);
  document.documentElement.style.setProperty('--tg-theme-text-color', theme.text_color);
});
```

### Обработка навигации

```tsx
import { useEffect } from 'react';
import { backButton } from '@telegram-apps/sdk-react';

function NavigationHandler() {
  useEffect(() => {
    const off = backButton.onClick(() => {
      // Логика навигации назад
      if (window.history.length > 1) {
        window.history.back();
      } else {
        // Закрыть приложение
        window.Telegram.WebApp.close();
      }
    });

    return off;
  }, []);

  return null;
}
```

### Работа с данными пользователя

```tsx
import { useLaunchParams } from '@telegram-apps/sdk-react';

function UserProfile() {
  const { tgWebAppData } = useLaunchParams();
  const user = tgWebAppData?.user;

  if (!user) {
    return <div>Loading user data...</div>;
  }

  return (
    <div>
      <h2>Welcome, {user.first_name}!</h2>
      <p>ID: {user.id}</p>
      <p>Username: @{user.username}</p>
    </div>
  );
}
```

## Миграция с v2 на v3

### Изменения в useLaunchParams

```tsx
// v2 (старый способ)
const { themeParams, initData } = useLaunchParams();

// v3 (новый способ)
const { tgWebAppThemeParams, tgWebAppData } = useLaunchParams();

// Для получения raw init data используйте отдельный хук
const initDataRaw = useRawInitData();
```

## Best Practices

1. **Инициализация**: Всегда вызывайте `init()` перед использованием SDK
2. **Монтирование**: Монтируйте компоненты перед их использованием
3. **Очистка**: Всегда очищайте обработчики событий в useEffect cleanup
4. **Обработка ошибок**: Проверяйте наличие данных перед их использованием
5. **Темизация**: Используйте CSS переменные для темизации

## Полезные ссылки

- [Официальная документация](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x)
- [Базовый SDK](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk/3-x)
- [Миграция v2 → v3](https://docs.telegram-mini-apps.com/packages/telegram-apps-sdk-react/3-x#migrating-from-v2-to-v3)
