import { FC } from 'react';
import { InputNumberFormat as RIInputNumberFormat, InputNumberFormatProps as RIInputNumberFormatProps } from '@react-input/number-format';
import Input, { InputPropsType } from './Input';


export type InputNumberFormatPropsType = InputPropsType & RIInputNumberFormatProps

const InputNumberFormat: FC<InputNumberFormatPropsType> = (props) => {
    return (
        <RIInputNumberFormat {...props} component={Input} />
    );
};

export default InputNumberFormat;