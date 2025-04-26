# Mortgage Calculator

A Telegram Mini App for calculating mortgage payments and generating amortization schedules.

## Features

- Calculate monthly mortgage payments
- Generate amortization schedules
- Support for early payments (one-time and regular)
- Support for different payment types (annuity and differentiated)
- Visualize payment data with charts
- View detailed payment schedule

## Architecture

The application follows a modular architecture with clear separation of concerns:

```
src/
├── components/     # UI components
├── config/         # Configuration files
├── forms/          # Form components
├── hooks/          # Custom React hooks
├── localization/   # Translations and localization utilities
├── navigation/     # Routing and navigation
├── providers/      # Context providers
├── schemas/        # Form validation schemas
├── services/       # Business logic services
├── types/          # TypeScript type definitions
└── utils/          # Utility functions
```

### Key Components

- **MortgageProvider**: Manages the mortgage data and calculations
- **MortgageService**: Handles the mortgage calculations (local or server-based)
- **LoanForm**: Collects loan details, early payments, and regular payments
- **MortageResult**: Displays the calculation results with charts and payment schedule

## Financial Core

The financial core is designed to be modular and extensible, following SOLID principles:

- **Single Responsibility**: Each class has a single responsibility
- **Open/Closed**: The system is open for extension but closed for modification
- **Liskov Substitution**: All implementations of interfaces can be used interchangeably
- **Interface Segregation**: Interfaces define only the methods needed by clients
- **Dependency Inversion**: High-level modules depend on abstractions, not concrete implementations

The financial core can be used either locally (in the browser) or remotely (on a server), making it easy to scale the application as needed.

## Getting Started

### Prerequisites

- Node.js (v14 or later)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## Configuration

The application can be configured in the `src/config` directory:

- `mortgage.ts`: Configure the mortgage service (local or server-based)

## Recent Refactoring

The codebase has recently undergone refactoring to improve its architecture and maintainability:

1. **Removed Dead Code**: Removed unused `homeValue` and `downPayment` fields
2. **Service Layer**: Added a service layer for mortgage calculations
3. **SOLID Principles**: Restructured the financial core to follow SOLID principles
4. **Preparation for Server-Side**: Added infrastructure for server-side calculations
5. **Configuration**: Added configuration options for easy switching between local and server implementations

## Future Improvements

- Add server-side implementation for mortgage calculations
- Implement caching for calculation results
- Add export functionality for payment schedules
- Improve mobile UI/UX
- Add comparison feature for different mortgage scenarios
