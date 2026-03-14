import { List, Section, Cell, Text, Radio } from '@telegram-apps/telegram-ui';
import type { AnyFieldApi } from '@tanstack/react-form';
import { hapticSelection } from '@/utils/haptic';

export type TypeRadioOption = { label: string; value: 'reduceTerm' | 'reducePayment' };

type Props = {
  field: AnyFieldApi;
  header: string;
  options: TypeRadioOption[];
};

function TypeRadioGroup({ field, header, options }: Props) {
  const value = field.state.value ?? 'reduceTerm';

  return (
    <Section header={header}>
      <List>
        {options.map(({ value: optValue, label }) => (
          <Cell
            key={optValue}
            Component="label"
            before={
              <Radio
                name={field.name}
                value={optValue}
                checked={value === optValue}
                onChange={() => {
                  hapticSelection();
                  field.handleChange(optValue);
                }}
              />
            }
          >
            <Text>{label}</Text>
          </Cell>
        ))}
      </List>
    </Section>
  );
}

export default TypeRadioGroup;
