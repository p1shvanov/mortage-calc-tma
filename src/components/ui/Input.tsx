import { forwardRef } from 'react';
import {
  Spinner,
  Input as TGInput,
  InputProps as TGInputProps,
} from '@telegram-apps/telegram-ui';
import type { AnyFieldApi } from '@tanstack/react-form';

export type InputPropsType = {
  field: AnyFieldApi;
} & TGInputProps;

const Input = forwardRef<HTMLInputElement, InputPropsType>(
  (props, forwardedRef) => {
    const { field, ...rest } = props;

    const { errors, isValidating } = field.state.meta;

    return (
      <TGInput
        {...rest}
        ref={forwardedRef}
        id={field.name}
        name={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        status={errors.length ? 'error' : 'default'}
        after={isValidating ? <Spinner size="s" /> : rest.after}
      />
    );
  }
);

export default Input;
