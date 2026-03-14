export * from './IMortgageService';
export * from './LocalMortgageService';
import { LocalMortgageService } from './LocalMortgageService';

/** Single mortgage service instance (local calculations only). */
export const mortgageService = new LocalMortgageService();
