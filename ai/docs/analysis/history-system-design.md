# Дизайн системы истории расчетов

## Обзор

Проектирование системы сохранения, управления и шаринга расчетов ипотеки с интеграцией в Telegram Mini App.

## 🎯 Цели системы

### Основные цели:
1. **Сохранение расчетов** - пользователи могут вернуться к предыдущим расчетам
2. **Синхронизация** - расчеты доступны на всех устройствах
3. **Шаринг** - возможность поделиться расчетом с другими
4. **Быстрый доступ** - удобный интерфейс для управления историей

### Дополнительные цели:
- **Экспорт данных** - возможность сохранить расчет в файл
- **Сравнение сценариев** - сопоставление разных вариантов
- **Аналитика** - статистика использования

## 🏗️ Архитектура системы

### 1. Структура данных

#### Модель расчета:
```typescript
interface SavedCalculation {
  id: string;                    // Уникальный ID
  title: string;                 // Название расчета
  description?: string;          // Описание
  createdAt: Date;              // Дата создания
  updatedAt: Date;              // Дата обновления
  isShared: boolean;            // Публичный ли расчет
  shareId?: string;             // ID для шаринга
  
  // Данные расчета
  loanDetails: LoanDetailsValues;
  earlyPayments: EarlyPayment[];
  regularPayments: RegularPayment[];
  
  // Результаты
  mortgageResults: MortgageCalculationResults;
  amortizationResult: AmortizationScheduleResults;
  
  // Метаданные
  tags: string[];               // Теги для поиска
  isFavorite: boolean;          // Избранное
  viewCount: number;            // Количество просмотров
}
```

#### Модель пользователя:
```typescript
interface UserProfile {
  id: string;
  calculations: SavedCalculation[];
  preferences: UserPreferences;
  statistics: UserStatistics;
}

interface UserPreferences {
  defaultLanguage: SupportedLanguage;
  defaultTheme: ThemeMode;
  autoSave: boolean;
  shareByDefault: boolean;
}

interface UserStatistics {
  totalCalculations: number;
  totalSavings: number;
  averageLoanAmount: number;
  mostUsedFeatures: string[];
}
```

### 2. Хранилище данных

#### Локальное хранилище (IndexedDB):
```typescript
// Структура IndexedDB
interface LocalStorage {
  calculations: SavedCalculation[];
  userProfile: UserProfile;
  settings: AppSettings;
  cache: {
    charts: Map<string, ChartData>;
    calculations: Map<string, CalculationData>;
  };
}
```

#### Telegram Cloud Storage:
```typescript
// Синхронизация через Telegram
interface CloudSync {
  calculations: SavedCalculation[];
  userProfile: UserProfile;
  lastSync: Date;
  version: string;
}
```

#### Глубокие ссылки:
```typescript
// Структура URL для шаринга
interface ShareLink {
  baseUrl: string;              // https://t.me/your_bot/app
  calculationId: string;        // ID расчета
  params: {
    view?: 'form' | 'result';   // Что показать
    highlight?: string;         // Что подсветить
    theme?: ThemeMode;          // Тема
    lang?: SupportedLanguage;   // Язык
  };
}
```

### 3. API для работы с данными

#### Сервис расчетов:
```typescript
class CalculationService {
  // Сохранение
  async saveCalculation(calculation: SavedCalculation): Promise<void>;
  async updateCalculation(id: string, updates: Partial<SavedCalculation>): Promise<void>;
  async deleteCalculation(id: string): Promise<void>;
  
  // Получение
  async getCalculation(id: string): Promise<SavedCalculation | null>;
  async getAllCalculations(): Promise<SavedCalculation[]>;
  async getCalculationsByTag(tag: string): Promise<SavedCalculation[]>;
  async searchCalculations(query: string): Promise<SavedCalculation[]>;
  
  // Шаринг
  async createShareLink(calculationId: string): Promise<string>;
  async getCalculationByShareId(shareId: string): Promise<SavedCalculation | null>;
  
  // Синхронизация
  async syncWithCloud(): Promise<void>;
  async exportCalculations(): Promise<Blob>;
  async importCalculations(file: File): Promise<void>;
}
```

#### Сервис шаринга:
```typescript
class ShareService {
  // Создание ссылок
  async createShareLink(calculation: SavedCalculation): Promise<string>;
  async createQRCode(shareLink: string): Promise<string>;
  
  // Отправка
  async shareViaTelegram(calculation: SavedCalculation): Promise<void>;
  async shareViaLink(calculation: SavedCalculation): Promise<void>;
  async copyToClipboard(text: string): Promise<void>;
  
  // Обработка входящих ссылок
  async handleIncomingLink(url: string): Promise<SavedCalculation | null>;
  async parseShareParams(params: URLSearchParams): Promise<ShareParams>;
}
```

## 🎨 UX дизайн

### 1. Начальный экран

#### Структура:
```
┌─────────────────────────────────┐
│ 🏠 Mortgage Calculator          │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Your Calculations (5)    │ │
│ │                             │ │
│ │ 🔥 House Purchase 2024      │ │
│ │    $500,000 • 3.5% • 30yr  │ │
│ │    Saved: $45,000           │ │
│ │                             │ │
│ │ 💰 Refinance Option         │ │
│ │    $450,000 • 4.2% • 25yr  │ │
│ │    Saved: $23,000           │ │
│ │                             │ │
│ │ 🏡 Investment Property      │ │
│ │    $300,000 • 5.1% • 20yr  │ │
│ │    Saved: $15,000           │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ➕ New Calculation          │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ ⚙️ Settings                 │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

#### Компоненты:
- **Header**: Название приложения + переключатели языка/темы
- **Calculations List**: Список сохраненных расчетов с превью
- **Quick Actions**: Кнопки для быстрых действий
- **Settings**: Доступ к настройкам

### 2. Карточка расчета

#### Структура:
```
┌─────────────────────────────────┐
│ 🔥 House Purchase 2024    ⭐   │
│                                 │
│ 💰 $500,000 • 3.5% • 30 years  │
│ 📅 Created: Jan 15, 2024        │
│ 👁️ Views: 12                    │
│                                 │
│ 💵 Monthly: $2,245              │
│ 💸 Total Interest: $308,280     │
│ 🎯 Early Payments: 3            │
│ 💚 Savings: $45,000             │
│                                 │
│ ┌─────────┐ ┌─────────┐ ┌─────┐ │
│ │ 👁️ View │ │ 📤 Share│ │ ⚙️  │ │
│ └─────────┘ └─────────┘ └─────┘ │
└─────────────────────────────────┘
```

#### Интерактивность:
- **Tap**: Открыть расчет
- **Long Press**: Контекстное меню
- **Swipe**: Быстрые действия (удалить, избранное)

### 3. Контекстное меню

#### Опции:
```
┌─────────────────────────────────┐
│ 🔥 House Purchase 2024          │
│                                 │
│ 👁️ View Details                 │
│ 📤 Share Calculation            │
│ 📋 Duplicate                    │
│ ⭐ Add to Favorites             │
│ 🏷️ Add Tags                    │
│ 📊 Compare with...              │
│ 📁 Export to PDF                │
│ 🗑️ Delete                      │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ Cancel                      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### 4. Экран шаринга

#### Опции шаринга:
```
┌─────────────────────────────────┐
│ 📤 Share Calculation            │
│                                 │
│ 🔥 House Purchase 2024          │
│ 💰 $500,000 • 3.5% • 30 years  │
│ 💚 Savings: $45,000             │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📱 Share via Telegram       │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 🔗 Copy Link                │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📄 Generate QR Code         │ │
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │ 📊 Export to PDF            │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

## 🔧 Техническая реализация

### 1. Хранилище данных

#### IndexedDB схема:
```typescript
// База данных
const DB_NAME = 'MortgageCalculator';
const DB_VERSION = 1;

// Stores
const STORES = {
  CALCULATIONS: 'calculations',
  USER_PROFILE: 'userProfile',
  SETTINGS: 'settings',
  CACHE: 'cache'
};

// Индексы для поиска
const INDEXES = {
  calculations: {
    byTitle: 'title',
    byCreatedAt: 'createdAt',
    byTags: 'tags',
    byIsFavorite: 'isFavorite'
  }
};
```

#### Сервис IndexedDB:
```typescript
class IndexedDBService {
  private db: IDBDatabase | null = null;
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        this.createStores(db);
      };
    });
  }
  
  private createStores(db: IDBDatabase): void {
    // Calculations store
    if (!db.objectStoreNames.contains(STORES.CALCULATIONS)) {
      const store = db.createObjectStore(STORES.CALCULATIONS, { keyPath: 'id' });
      store.createIndex('byTitle', 'title', { unique: false });
      store.createIndex('byCreatedAt', 'createdAt', { unique: false });
      store.createIndex('byTags', 'tags', { unique: false, multiEntry: true });
      store.createIndex('byIsFavorite', 'isFavorite', { unique: false });
    }
    
    // User profile store
    if (!db.objectStoreNames.contains(STORES.USER_PROFILE)) {
      db.createObjectStore(STORES.USER_PROFILE, { keyPath: 'id' });
    }
    
    // Settings store
    if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
      db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
    }
    
    // Cache store
    if (!db.objectStoreNames.contains(STORES.CACHE)) {
      db.createObjectStore(STORES.CACHE, { keyPath: 'key' });
    }
  }
}
```

### 2. Telegram Cloud Storage

#### Интеграция:
```typescript
class TelegramCloudService {
  private cloudStorage: CloudStorage;
  
  constructor() {
    this.cloudStorage = new CloudStorage();
  }
  
  async saveCalculation(calculation: SavedCalculation): Promise<void> {
    const key = `calculation_${calculation.id}`;
    const data = JSON.stringify(calculation);
    await this.cloudStorage.setItem(key, data);
  }
  
  async getCalculation(id: string): Promise<SavedCalculation | null> {
    const key = `calculation_${id}`;
    const data = await this.cloudStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }
  
  async getAllCalculations(): Promise<SavedCalculation[]> {
    const keys = await this.cloudStorage.getKeys();
    const calculationKeys = keys.filter(key => key.startsWith('calculation_'));
    
    const calculations = await Promise.all(
      calculationKeys.map(key => this.getCalculation(key.replace('calculation_', '')))
    );
    
    return calculations.filter(Boolean) as SavedCalculation[];
  }
  
  async syncWithLocal(localCalculations: SavedCalculation[]): Promise<void> {
    const cloudCalculations = await this.getAllCalculations();
    
    // Merge strategies
    const merged = this.mergeCalculations(localCalculations, cloudCalculations);
    
    // Save back to cloud
    await Promise.all(
      merged.map(calc => this.saveCalculation(calc))
    );
  }
  
  private mergeCalculations(
    local: SavedCalculation[], 
    cloud: SavedCalculation[]
  ): SavedCalculation[] {
    const merged = new Map<string, SavedCalculation>();
    
    // Add local calculations
    local.forEach(calc => merged.set(calc.id, calc));
    
    // Merge with cloud (cloud wins on conflicts)
    cloud.forEach(calc => {
      const existing = merged.get(calc.id);
      if (!existing || calc.updatedAt > existing.updatedAt) {
        merged.set(calc.id, calc);
      }
    });
    
    return Array.from(merged.values());
  }
}
```

### 3. Система шаринга

#### Генерация ссылок:
```typescript
class ShareLinkGenerator {
  private baseUrl: string;
  
  constructor() {
    this.baseUrl = 'https://t.me/your_bot/app';
  }
  
  generateShareLink(calculation: SavedCalculation, params?: ShareParams): string {
    const url = new URL(this.baseUrl);
    
    // Add calculation ID
    url.searchParams.set('calc', calculation.id);
    
    // Add optional parameters
    if (params?.view) {
      url.searchParams.set('view', params.view);
    }
    if (params?.theme) {
      url.searchParams.set('theme', params.theme);
    }
    if (params?.lang) {
      url.searchParams.set('lang', params.lang);
    }
    if (params?.highlight) {
      url.searchParams.set('highlight', params.highlight);
    }
    
    return url.toString();
  }
  
  parseShareLink(url: string): ShareParams | null {
    try {
      const urlObj = new URL(url);
      const calculationId = urlObj.searchParams.get('calc');
      
      if (!calculationId) return null;
      
      return {
        calculationId,
        view: urlObj.searchParams.get('view') as 'form' | 'result' || 'result',
        theme: urlObj.searchParams.get('theme') as ThemeMode || undefined,
        lang: urlObj.searchParams.get('lang') as SupportedLanguage || undefined,
        highlight: urlObj.searchParams.get('highlight') || undefined
      };
    } catch {
      return null;
    }
  }
}
```

#### QR код генерация:
```typescript
class QRCodeService {
  async generateQRCode(data: string, size: number = 200): Promise<string> {
    // Используем библиотеку qrcode
    const QRCode = await import('qrcode');
    return QRCode.toDataURL(data, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });
  }
  
  async generateShareQR(calculation: SavedCalculation): Promise<string> {
    const shareLink = this.shareLinkGenerator.generateShareLink(calculation);
    return this.generateQRCode(shareLink);
  }
}
```

### 4. Навигация и роутинг

#### Обновленные маршруты:
```typescript
export const routes: Route[] = [
  { path: '/', Component: HomePage },                    // Начальный экран
  { path: '/new', Component: LoanForm },                 // Новая форма
  { path: '/calculation/:id', Component: CalculationView }, // Просмотр расчета
  { path: '/calculation/:id/edit', Component: LoanForm }, // Редактирование
  { path: '/result', Component: MortageResult },         // Результаты
  { path: '/settings', Component: SettingsPage },        // Настройки
  { path: '/share/:id', Component: SharePage },          // Страница шаринга
];
```

#### Обработка глубоких ссылок:
```typescript
class DeepLinkHandler {
  private shareService: ShareService;
  
  constructor() {
    this.shareService = new ShareService();
  }
  
  async handleIncomingLink(): Promise<void> {
    const urlParams = new URLSearchParams(window.location.search);
    const shareParams = this.shareService.parseShareParams(urlParams);
    
    if (shareParams) {
      await this.navigateToCalculation(shareParams);
    }
  }
  
  private async navigateToCalculation(params: ShareParams): Promise<void> {
    const calculation = await this.shareService.getCalculationByShareId(params.calculationId);
    
    if (calculation) {
      // Set theme and language
      if (params.theme) {
        this.themeService.setTheme(params.theme);
      }
      if (params.lang) {
        this.localizationService.setLanguage(params.lang);
      }
      
      // Navigate to calculation
      if (params.view === 'form') {
        this.navigate(`/calculation/${calculation.id}/edit`);
      } else {
        this.navigate(`/calculation/${calculation.id}`);
      }
      
      // Highlight specific elements
      if (params.highlight) {
        this.highlightElement(params.highlight);
      }
    }
  }
}
```

## 📱 Интеграция с Telegram SDK

### 1. Main Button для быстрых действий

```typescript
class TelegramMainButton {
  private mainButton: MainButton;
  
  constructor() {
    this.mainButton = new MainButton();
  }
  
  showCalculate(): void {
    this.mainButton.setText('Calculate');
    this.mainButton.setParams({
      color: '#4CAF50',
      text_color: '#FFFFFF'
    });
    this.mainButton.onClick(() => {
      // Handle calculate
    });
    this.mainButton.show();
  }
  
  showSave(): void {
    this.mainButton.setText('Save Calculation');
    this.mainButton.setParams({
      color: '#2196F3',
      text_color: '#FFFFFF'
    });
    this.mainButton.onClick(() => {
      // Handle save
    });
    this.mainButton.show();
  }
  
  showShare(): void {
    this.mainButton.setText('Share');
    this.mainButton.setParams({
      color: '#FF9800',
      text_color: '#FFFFFF'
    });
    this.mainButton.onClick(() => {
      // Handle share
    });
    this.mainButton.show();
  }
  
  hide(): void {
    this.mainButton.hide();
  }
}
```

### 2. Haptic Feedback

```typescript
class HapticFeedbackService {
  private haptic: HapticFeedback;
  
  constructor() {
    this.haptic = new HapticFeedback();
  }
  
  success(): void {
    this.haptic.notificationOccurred('success');
  }
  
  error(): void {
    this.haptic.notificationOccurred('error');
  }
  
  warning(): void {
    this.haptic.notificationOccurred('warning');
  }
  
  impact(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft'): void {
    this.haptic.impactOccurred(style);
  }
  
  selection(): void {
    this.haptic.selectionChanged();
  }
}
```

### 3. Popup для подтверждений

```typescript
class PopupService {
  private popup: Popup;
  
  constructor() {
    this.popup = new Popup();
  }
  
  async confirmDelete(calculation: SavedCalculation): Promise<boolean> {
    return this.popup.open({
      title: 'Delete Calculation',
      message: `Are you sure you want to delete "${calculation.title}"?`,
      buttons: [
        { id: 'cancel', type: 'cancel' },
        { id: 'delete', type: 'destructive', text: 'Delete' }
      ]
    }).then(result => result === 'delete');
  }
  
  async confirmShare(calculation: SavedCalculation): Promise<boolean> {
    return this.popup.open({
      title: 'Share Calculation',
      message: `Share "${calculation.title}" with others?`,
      buttons: [
        { id: 'cancel', type: 'cancel' },
        { id: 'share', type: 'default', text: 'Share' }
      ]
    }).then(result => result === 'share');
  }
}
```

## 🎯 Заключение

Система истории расчетов обеспечит:

1. **Сохранение данных** - расчеты не потеряются
2. **Синхронизацию** - доступ на всех устройствах
3. **Шаринг** - возможность поделиться результатами
4. **Удобство** - быстрый доступ к предыдущим расчетам
5. **Интеграцию** - использование возможностей Telegram

Следующий шаг - создание детального плана реализации.
