import React from 'react';
import { Input } from '@telegram-apps/telegram-ui';
import styles from './FormField.module.css';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  error?: string;
  min?: number;
  max?: number;
  step?: number;
  after?: React.ReactNode;
}

export function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  min,
  max,
  step,
  after
}: FormFieldProps) {
  return (
    <div className={styles.formField}>
      <Input
        header={label}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        status={error ? 'error' : 'default'}
        after={after}
        min={min}
        max={max}
        step={step}
      />
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}
