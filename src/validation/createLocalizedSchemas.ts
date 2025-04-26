import { z } from 'zod';
import { unformat } from '@react-input/number-format';

// Type for the localization function
type TranslationFunction = (key: string, params?: Record<string, string | number>) => string;

/**
 * Creates localized schema factory functions
 * @param t Translation function
 * @returns Object with schema creation functions
 */
export const createLocalizedSchemas = (t: TranslationFunction) => {
  // Create a custom error map for Zod
  const customErrorMap: z.ZodErrorMap = (issue, ctx) => {
    // Use the default error map as fallback
    const defaultError = z.defaultErrorMap(issue, ctx);
    
    // Return localized error messages based on error code
    switch (issue.code) {
      case z.ZodIssueCode.invalid_type:
        if (issue.expected === 'number') {
          return { message: t('invalidNumber') };
        }
        break;
      case z.ZodIssueCode.too_small:
        if (issue.type === 'number' && issue.minimum === 0) {
          return { message: t('mustBePositive') };
        }
        break;
      // Add more cases as needed
    }
    
    // Fallback to default error message
    return defaultError;
  };

  // Set the error map for this instance
  z.setErrorMap(customErrorMap);

  // Factory functions for common schema patterns
  return {
    /**
     * Creates a localized number schema with common validations
     */
    createNumberSchema: (options: {
      fieldName: string;
      min?: number;
      max?: number;
    }) => {
      const { fieldName, min = 0, max } = options;
      
      return z.string()
        .transform((val) => {
          const unformatted = unformat(val);
          return parseFloat(unformatted);
        })
        .refine((val) => !isNaN(val), t('mustBeNumber', { field: t(fieldName) }))
        .refine((val) => val > min, t('mustBeGreaterThan', { field: t(fieldName), value: min }))
        .refine(
          (val) => max === undefined || val <= max, 
          max !== undefined ? t('mustBeLessThan', { field: t(fieldName), value: max }) : ''
        );
    },

    /**
     * Creates a localized date schema
     */
    createDateSchema: (options: {
      fieldName: string;
    }) => {
      const { fieldName } = options;
      
      return z.string().refine((date) => {
        const dateObj = new Date(date);
        return !isNaN(dateObj.getTime());
      }, t('invalidDate', { field: t(fieldName) }));
    },

    /**
     * Creates a localized date range validation
     */
    createDateRangeRefinement: (options: {
      startField: string;
      endField: string;
      endIsOptional?: boolean;
    }) => {
      const { startField, endField, endIsOptional = false } = options;
      
      return (data: any) => {
        // If end date is optional and not provided, validation passes
        if (endIsOptional && !data[endField]) return true;
        
        const startDate = new Date(data[startField]);
        const endDate = new Date(data[endField]);
        
        return endDate >= startDate;
      };
    },

    /**
     * Returns localized date range error message
     */
    getDateRangeErrorMessage: (options: {
      startField: string;
      endField: string;
    }) => {
      const { startField, endField } = options;
      
      return {
        message: t('endDateAfterStart', { 
          startField: t(startField), 
          endField: t(endField) 
        }),
        path: [endField],
      };
    }
  };
};
