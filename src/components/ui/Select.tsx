import { forwardRef } from 'react';
import {
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
  const { errors } = field.state.meta;

  return (
    <TGSelect
      {...rest}
      id={field.name}
      name={field.name}
      value={field.state.value}
      onBlur={field.handleBlur}
      onChange={(e) => field.handleChange(e.target.value)}
      status={errors.length ? 'error' : 'default'}
    >
      {options.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </TGSelect>
  );
});

export default Select;
