import { IMortgageService } from './IMortgageService';
import { LocalMortgageService } from './LocalMortgageService';
import { ServerMortgageService } from './ServerMortgageService';
import { mortgageConfig } from '@/config/mortgage';

/**
 * Factory for creating mortgage service instances
 * This factory makes it easy to switch between different implementations
 */
export class MortgageServiceFactory {
  /**
   * Create a mortgage service instance
   * @param type The type of mortgage service to create
   * @returns A mortgage service instance
   */
  static createMortgageService(type: 'local' | 'server' = 'local', apiBaseUrl?: string): IMortgageService {
    switch (type) {
      case 'local':
        return new LocalMortgageService();
      case 'server':
        try {
          return new ServerMortgageService(apiBaseUrl);
        } catch (error) {
          console.warn('Error creating server implementation, falling back to local implementation:', error);
          return new LocalMortgageService();
        }
      default:
        return new LocalMortgageService();
    }
  }
}

/**
 * Default mortgage service instance
 * This is a singleton instance that can be used throughout the application
 */
export const mortgageService = MortgageServiceFactory.createMortgageService(
  mortgageConfig.serviceType,
  mortgageConfig.apiBaseUrl
);
