# Mortgage Service

Calculations are done locally in the browser. This module exposes the mortgage service interface and the single `mortgageService` instance used by the app.

## Components

### IMortgageService

Interface for mortgage calculations: `calculateBase` (loan-only summary) and `generateAmortizationSchedule` (with optional overpayments).

### LocalMortgageService

Implementation that uses `@/utils/mortgageCalculator` and `@/utils/amortizationSchedule`.

### mortgageService

Single instance (`new LocalMortgageService()`) exported from this module. Use it via:

```typescript
import { mortgageService } from '@/services/mortgage';

const results = await mortgageService.calculateBase({ ... });
const schedule = await mortgageService.generateAmortizationSchedule({ ... });
```
