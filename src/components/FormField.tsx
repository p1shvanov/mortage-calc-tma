import React, { memo } from 'react';

import { Caption, Input } from '@telegram-apps/telegram-ui';

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

const FormField = ({
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
  after,
}: FormFieldProps) => {
  return (
    <>
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
      {error && (
        <Caption
          style={{
            color: 'var(--tg-theme-destructive-text-color)',
            padding: '0 24px',
          }}
        >
          {error}
        </Caption>
      )}
    </>
  );
};

export default memo(FormField);
