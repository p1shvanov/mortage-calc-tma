# Mortgage Service

This directory contains the mortgage service implementation, which is responsible for calculating mortgage payments and generating amortization schedules.

## Architecture

The mortgage service follows the SOLID principles and is designed to be easily extensible and maintainable:

- **Single Responsibility Principle**: Each class has a single responsibility. For example, the `LocalMortgageService` is responsible for performing calculations locally, while the `ServerMortgageService` is responsible for communicating with a server API.

- **Open/Closed Principle**: The service is open for extension but closed for modification. New implementations can be added without modifying existing code.

- **Liskov Substitution Principle**: All implementations of the `IMortgageService` interface can be used interchangeably.

- **Interface Segregation Principle**: The `IMortgageService` interface defines only the methods that are needed by clients.

- **Dependency Inversion Principle**: High-level modules depend on abstractions, not concrete implementations.

## Components

### IMortgageService

This is the main interface that defines the contract for mortgage services. It includes methods for calculating mortgage payments and generating amortization schedules.

### LocalMortgageService

This is a concrete implementation of the `IMortgageService` interface that performs calculations locally in the browser. It uses the utility functions in the `utils` directory.

### ServerMortgageService

This is a concrete implementation of the `IMortgageService` interface that communicates with a server API for calculations. This is useful for more complex calculations or when you want to offload the calculations to a server.

### MortgageServiceFactory

This is a factory class that creates instances of the `IMortgageService` interface. It can create either a `LocalMortgageService` or a `ServerMortgageService` based on the configuration.

## Configuration

The mortgage service can be configured in the `src/config/mortgage.ts` file. The following options are available:

- `serviceType`: The type of mortgage service to use. Can be either `'local'` or `'server'`.
- `apiBaseUrl`: The base URL for the mortgage API. Only used when `serviceType` is `'server'`.

## Usage

To use the mortgage service, import the `mortgageService` instance from the `src/services/mortgage` directory:

```typescript
import { mortgageService } from '@/services/mortgage';

// Calculate mortgage payments
const results = await mortgageService.calculateMortgage({
  loanAmount: 200000,
  interestRate: 4.5,
  loanTerm: 30,
  startDate: '2023-01-01',
  paymentType: 'annuity',
  paymentDay: 1
});

// Generate amortization schedule
const schedule = await mortgageService.generateAmortizationSchedule({
  loanAmount: 200000,
  interestRate: 4.5,
  loanTerm: 30,
  startDate: '2023-01-01',
  paymentType: 'annuity',
  paymentDay: 1,
  earlyPayments: [
    {
      id: '1',
      date: '2023-06-01',
      amount: 10000,
      type: 'reduceTerm'
    }
  ],
  regularPayments: [
    {
      id: '1',
      amount: 100,
      startMonth: '2023-02-01',
      endMonth: '2023-12-01',
      type: 'reduceTerm'
    }
  ]
});
```

## Extending the Service

To add a new implementation of the `IMortgageService` interface:

1. Create a new class that implements the `IMortgageService` interface.
2. Add the new implementation to the `MortgageServiceFactory` class.
3. Update the `mortgageConfig` object to include the new implementation type.
