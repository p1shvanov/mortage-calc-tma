import { forwardRef } from 'react';
import {
  Caption,
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

    const { isTouched, errors, isValidating } = field.state.meta;

    return (
      <>
        <TGInput
          {...rest}
          ref={forwardedRef}
          id={field.name}
          name={field.name}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          status={errors.length ? 'error' : 'default'}
          after={isValidating ? <Spinner size='s' /> : rest.after}
        />
        {isTouched && errors.length ? (
          <Caption
            style={{
              color: 'var(--tg-theme-destructive-text-color)',
              padding: '0 24px',
            }}
          >
            {errors.map((error) => error.message).join(', ')}
          </Caption>
        ) : null}
      </>
    );
  }
);

export default Input;
