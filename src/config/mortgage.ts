/**
 * Configuration for the mortgage service
 */
export const mortgageConfig = {
  /**
   * The type of mortgage service to use
   * 'local': Use the local implementation (calculations done in the browser)
   * 'server': Use the server implementation (calculations done on the server)
   */
  serviceType: 'local' as 'local' | 'server',

  /**
   * The base URL for the mortgage API
   * Only used when serviceType is 'server'
   */
  apiBaseUrl: '/api/mortgage',
};
