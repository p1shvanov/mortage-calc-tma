# Анализ хранилища данных

## Обзор

Детальный анализ требований к глобальному хранилищу данных для приложения Mortgage Calculator TMA с учетом интеграции с Telegram Cloud Storage.

## 🔍 Анализ текущего состояния

### 1. Текущая архитектура управления данными

#### Существующие провайдеры:
```typescript
// MortgageProvider - основное состояние приложения
interface MortgageContextType {
  loanDetails: LoanDetailsValues | null;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
  mortgageResults: MortgageCalculationResults | null;
  amortizationResult: AmortizationScheduleResults | null;
  // ... setters
}

// LocalizationProvider - настройки локализации
interface LocalizationContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  // ... formatters
}
```

#### Проблемы текущего подхода:
- **Нет персистентности**: Состояние теряется при перезагрузке
- **Нет истории**: Невозможно сохранить расчеты
- **Нет синхронизации**: Данные не доступны на других устройствах
- **Смешение ответственности**: Бизнес-логика в провайдерах
- **Нет кэширования**: Пересчеты при каждом изменении

## 📋 Требования к хранилищу

### 1. Функциональные требования

#### Основные функции:
- **Сохранение расчетов** - локально и в облаке
- **Синхронизация** - между устройствами пользователя
- **Офлайн работа** - доступ к данным без интернета
- **История расчетов** - просмотр предыдущих расчетов
- **Шаринг** - возможность поделиться расчетом
- **Экспорт/импорт** - резервное копирование данных

#### Данные для хранения:
```typescript
// Расчеты
interface SavedCalculation {
  id: string;
  title: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  isShared: boolean;
  shareId?: string;
  
  // Данные расчета
  loanDetails: LoanDetailsValues;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
  
  // Результаты
  mortgageResults: MortgageCalculationResults;
  amortizationResult: AmortizationScheduleResults;
  
  // Метаданные
  tags: string[];
  isFavorite: boolean;
  viewCount: number;
}

// Пользователь
interface UserProfile {
  id: string;
  calculations: SavedCalculation[];
  preferences: UserPreferences;
  statistics: UserStatistics;
}

// Настройки
interface AppSettings {
  language: SupportedLanguage;
  theme: ThemeMode;
  autoSave: boolean;
  shareByDefault: boolean;
  notifications: NotificationSettings;
}
```

### 2. Технические требования

#### Производительность:
- **Время загрузки**: < 100ms для локальных данных
- **Время синхронизации**: < 2s для облачных данных
- **Размер данных**: < 1MB на расчет
- **Количество расчетов**: до 1000 на пользователя

#### Надежность:
- **Офлайн работа**: 100% доступность локальных данных
- **Синхронизация**: Автоматическая при восстановлении связи
- **Резервное копирование**: Локальное + облачное
- **Восстановление**: Автоматическое при ошибках

#### Безопасность:
- **Шифрование**: Локальные данные зашифрованы
- **Приватность**: Данные не передаются третьим лицам
- **Валидация**: Проверка целостности данных
- **Очистка**: Возможность удаления всех данных

## 🏗️ Варианты архитектуры

### 1. State Management подходы

#### Вариант 1: React Context + useReducer
```typescript
// Плюсы:
+ Простота реализации
+ Нет дополнительных зависимостей
+ Хорошая интеграция с React
+ Легкое тестирование

// Минусы:
- Сложность при росте приложения
- Нет встроенной персистентности
- Сложная синхронизация
- Нет middleware

// Оценка: 6/10
```

#### Вариант 2: Zustand
```typescript
// Плюсы:
+ Минимальный boilerplate
+ Отличная производительность
+ Встроенная персистентность
+ Простая синхронизация
+ Легкое тестирование

// Минусы:
- Новая зависимость
- Меньше экосистемы
- Сложность при больших приложениях

// Оценка: 8/10
```

#### Вариант 3: Redux Toolkit
```typescript
// Плюсы:
+ Мощная экосистема
+ Отличные devtools
+ Предсказуемость
+ Хорошая масштабируемость
+ Много middleware

// Минусы:
- Много boilerplate
- Сложность для простых случаев
- Большой размер бандла
- Крутая кривая обучения

// Оценка: 7/10
```

#### Вариант 4: Jotai
```typescript
// Плюсы:
+ Атомарное состояние
+ Отличная производительность
+ Минимальный re-render
+ Простая композиция
+ Хорошая типизация

// Минусы:
- Новая парадигма
- Меньше экосистемы
- Сложность для новичков
- Нет встроенной персистентности

// Оценка: 7/10
```

### 2. Хранилище данных

#### Вариант 1: IndexedDB + Telegram Cloud Storage
```typescript
// Плюсы:
+ Мощное локальное хранилище
+ Асинхронная работа
+ Большой объем данных
+ Нативная поддержка в браузере
+ Интеграция с Telegram

// Минусы:
- Сложность API
- Нет встроенной синхронизации
- Сложное тестирование
- Ограничения Cloud Storage

// Оценка: 8/10
```

#### Вариант 2: localStorage + Telegram Cloud Storage
```typescript
// Плюсы:
+ Простота использования
+ Синхронная работа
+ Легкое тестирование
+ Хорошая поддержка

// Минусы:
- Ограниченный объем (5-10MB)
- Синхронная работа блокирует UI
- Нет сложных запросов
- Ограничения по типу данных

// Оценка: 6/10
```

#### Вариант 3: SQLite + Telegram Cloud Storage
```typescript
// Плюсы:
+ Мощные запросы
+ ACID транзакции
+ Отличная производительность
+ Сложные отношения

// Минусы:
- Сложность реализации
- Большой размер
- Нет нативной поддержки
- Сложное тестирование

// Оценка: 5/10
```

### 3. Синхронизация

#### Стратегия 1: Cloud Storage как источник истины
```typescript
// Плюсы:
+ Простота реализации
+ Единый источник данных
+ Автоматическая синхронизация

// Минусы:
- Зависимость от интернета
- Медленная работа
- Сложное тестирование
- Ограничения Cloud Storage

// Оценка: 4/10
```

#### Стратегия 2: Локальное хранилище + синхронизация
```typescript
// Плюсы:
+ Быстрая работа
+ Офлайн доступ
+ Гибкая синхронизация
+ Легкое тестирование

// Минусы:
+ Сложность реализации
+ Конфликты данных
+ Нужна стратегия разрешения

// Оценка: 9/10
```

#### Стратегия 3: Гибридный подход
```typescript
// Плюсы:
+ Лучшее из двух миров
+ Гибкость
+ Производительность
+ Надежность

// Минусы:
+ Сложность реализации
+ Нужна четкая стратегия
+ Больше кода

// Оценка: 8/10
```

## 🎯 Рекомендуемое решение

### 1. State Management: Zustand

#### Обоснование:
- **Простота**: Минимальный boilerplate
- **Производительность**: Оптимизированные re-renders
- **Персистентность**: Встроенная поддержка
- **Типизация**: Отличная поддержка TypeScript
- **Размер**: Маленький bundle size
- **Тестирование**: Легкое unit тестирование

#### Архитектура:
```typescript
// Главный store
interface AppStore {
  // Пользователь
  user: UserProfile | null;
  setUser: (user: UserProfile) => void;
  
  // Расчеты
  calculations: SavedCalculation[];
  addCalculation: (calculation: SavedCalculation) => void;
  updateCalculation: (id: string, updates: Partial<SavedCalculation>) => void;
  deleteCalculation: (id: string) => void;
  
  // Настройки
  settings: AppSettings;
  updateSettings: (settings: Partial<AppSettings>) => void;
  
  // Синхронизация
  syncStatus: SyncStatus;
  sync: () => Promise<void>;
  
  // UI состояние
  ui: UIState;
  setUI: (ui: Partial<UIState>) => void;
}
```

### 2. Хранилище: IndexedDB + Telegram Cloud Storage

#### Обоснование:
- **Локальное хранилище**: IndexedDB для быстрого доступа
- **Облачное хранилище**: Telegram Cloud Storage для синхронизации
- **Гибридный подход**: Лучшее из двух миров
- **Производительность**: Быстрая работа + синхронизация

#### Архитектура:
```typescript
// Локальное хранилище
class IndexedDBStorage {
  async saveCalculation(calculation: SavedCalculation): Promise<void>;
  async getCalculation(id: string): Promise<SavedCalculation | null>;
  async getAllCalculations(): Promise<SavedCalculation[]>;
  async deleteCalculation(id: string): Promise<void>;
  async clear(): Promise<void>;
}

// Облачное хранилище
class TelegramCloudStorage {
  async saveCalculation(calculation: SavedCalculation): Promise<void>;
  async getCalculation(id: string): Promise<SavedCalculation | null>;
  async getAllCalculations(): Promise<SavedCalculation[]>;
  async deleteCalculation(id: string): Promise<void>;
  async sync(): Promise<void>;
}

// Менеджер синхронизации
class SyncManager {
  async sync(): Promise<void>;
  async resolveConflicts(): Promise<void>;
  async backup(): Promise<void>;
  async restore(): Promise<void>;
}
```

### 3. Стратегия синхронизации: Локальное + Cloud

#### Принципы:
1. **Локальное хранилище** - основной источник данных
2. **Cloud Storage** - для синхронизации между устройствами
3. **Автоматическая синхронизация** - при изменении данных
4. **Разрешение конфликтов** - по timestamp последнего изменения
5. **Офлайн работа** - полная функциональность без интернета

#### Алгоритм синхронизации:
```typescript
async function syncData() {
  try {
    // 1. Получить локальные данные
    const localData = await localStorage.getAllCalculations();
    
    // 2. Получить облачные данные
    const cloudData = await cloudStorage.getAllCalculations();
    
    // 3. Объединить данные (локальные приоритет)
    const mergedData = mergeData(localData, cloudData);
    
    // 4. Сохранить локально
    await localStorage.saveCalculations(mergedData);
    
    // 5. Синхронизировать с облаком
    await cloudStorage.saveCalculations(mergedData);
    
    // 6. Обновить store
    store.setCalculations(mergedData);
  } catch (error) {
    console.error('Sync failed:', error);
    // Продолжить работу с локальными данными
  }
}
```

## 🔧 Техническая реализация

### 1. Структура проекта

```
src/
├── stores/
│   ├── appStore.ts          # Главный store
│   ├── calculationStore.ts  # Store расчетов
│   └── settingsStore.ts     # Store настроек
├── services/
│   ├── storage/
│   │   ├── IndexedDBStorage.ts
│   │   ├── TelegramCloudStorage.ts
│   │   └── SyncManager.ts
│   └── storage/
│       ├── StorageService.ts
│       └── MockStorageService.ts
├── hooks/
│   ├── useStorage.ts
│   ├── useSync.ts
│   └── useCalculations.ts
└── types/
    ├── storage.ts
    └── sync.ts
```

### 2. Мокирование Cloud Storage

#### Стратегия мокирования:
```typescript
// Интерфейс для хранилища
interface StorageInterface {
  saveCalculation(calculation: SavedCalculation): Promise<void>;
  getCalculation(id: string): Promise<SavedCalculation | null>;
  getAllCalculations(): Promise<SavedCalculation[]>;
  deleteCalculation(id: string): Promise<void>;
}

// Реальная реализация
class TelegramCloudStorage implements StorageInterface {
  // Использует Telegram Cloud Storage API
}

// Мок для разработки
class MockCloudStorage implements StorageInterface {
  private data: Map<string, SavedCalculation> = new Map();
  
  async saveCalculation(calculation: SavedCalculation): Promise<void> {
    this.data.set(calculation.id, calculation);
  }
  
  async getCalculation(id: string): Promise<SavedCalculation | null> {
    return this.data.get(id) || null;
  }
  
  async getAllCalculations(): Promise<SavedCalculation[]> {
    return Array.from(this.data.values());
  }
  
  async deleteCalculation(id: string): Promise<void> {
    this.data.delete(id);
  }
}

// Фабрика хранилища
class StorageFactory {
  static createCloudStorage(): StorageInterface {
    if (process.env.NODE_ENV === 'development') {
      return new MockCloudStorage();
    }
    return new TelegramCloudStorage();
  }
}
```

### 3. Интеграция с Zustand

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { StorageService } from '@/services/storage/StorageService';

interface AppStore {
  // Состояние
  calculations: SavedCalculation[];
  settings: AppSettings;
  syncStatus: SyncStatus;
  
  // Действия
  addCalculation: (calculation: SavedCalculation) => void;
  updateCalculation: (id: string, updates: Partial<SavedCalculation>) => void;
  deleteCalculation: (id: string) => void;
  sync: () => Promise<void>;
  
  // Настройки
  updateSettings: (settings: Partial<AppSettings>) => void;
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Начальное состояние
      calculations: [],
      settings: defaultSettings,
      syncStatus: 'idle',
      
      // Действия с расчетами
      addCalculation: async (calculation) => {
        set((state) => ({
          calculations: [...state.calculations, calculation]
        }));
        
        // Сохранить в хранилище
        await StorageService.saveCalculation(calculation);
        
        // Синхронизировать
        await get().sync();
      },
      
      updateCalculation: async (id, updates) => {
        set((state) => ({
          calculations: state.calculations.map(calc =>
            calc.id === id ? { ...calc, ...updates } : calc
          )
        }));
        
        // Обновить в хранилище
        await StorageService.updateCalculation(id, updates);
        
        // Синхронизировать
        await get().sync();
      },
      
      deleteCalculation: async (id) => {
        set((state) => ({
          calculations: state.calculations.filter(calc => calc.id !== id)
        }));
        
        // Удалить из хранилища
        await StorageService.deleteCalculation(id);
        
        // Синхронизировать
        await get().sync();
      },
      
      // Синхронизация
      sync: async () => {
        set({ syncStatus: 'syncing' });
        
        try {
          await StorageService.sync();
          set({ syncStatus: 'success' });
        } catch (error) {
          console.error('Sync failed:', error);
          set({ syncStatus: 'error' });
        }
      },
      
      // Настройки
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings }
        }));
      }
    }),
    {
      name: 'mortgage-calculator-storage',
      partialize: (state) => ({
        calculations: state.calculations,
        settings: state.settings
      })
    }
  )
);
```

## 📊 Ожидаемые результаты

### 1. Производительность
- **Время загрузки**: < 100ms для локальных данных
- **Время синхронизации**: < 2s для облачных данных
- **Размер бандла**: +15KB (Zustand + IndexedDB)
- **Память**: < 50MB для 1000 расчетов

### 2. Надежность
- **Офлайн работа**: 100% функциональность
- **Синхронизация**: Автоматическая при восстановлении связи
- **Восстановление**: Автоматическое при ошибках
- **Резервное копирование**: Локальное + облачное

### 3. Удобство разработки
- **Тестирование**: Легкое мокирование
- **Отладка**: Zustand DevTools
- **Типизация**: Полная поддержка TypeScript
- **Документация**: Подробные примеры

## 🎯 Заключение

Рекомендуемое решение:
- **State Management**: Zustand
- **Локальное хранилище**: IndexedDB
- **Облачное хранилище**: Telegram Cloud Storage
- **Синхронизация**: Гибридный подход
- **Мокирование**: MockCloudStorage для разработки

Это решение обеспечивает:
- Высокую производительность
- Надежную работу
- Легкое тестирование
- Масштабируемость
- Простоту разработки

