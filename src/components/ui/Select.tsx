import { forwardRef } from 'react';
import {
  Caption,
  Select as TGSelect,
  SelectProps as TGSelectProps,
} from '@telegram-apps/telegram-ui';

import type { AnyFieldApi } from '@tanstack/react-form';

export type SelectOptionType = {
  label: string;
  value: string;
};

export type SelectPropsType = {
  field: AnyFieldApi;
  options: SelectOptionType[];
} & Omit<TGSelectProps, 'children'>;

const Select = forwardRef<HTMLSelectElement, SelectPropsType>((props) => {
  const { field, options, ...rest } = props;
  const { isTouched, errors } = field.state.meta;

  return (
    <>
      <TGSelect
        {...rest}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
      >
        {options.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </TGSelect>
      {isTouched && errors.length ? (
        <Caption
          style={{
            color: 'var(--tg-theme-destructive-text-color)',
            padding: '0 24px',
          }}
        >
          {errors.join(', ')}
        </Caption>
      ) : null}
    </>
  );
});

export default Select;
