import type { CheckboxChecked } from '../private/InlineField/StyledInput';

export const resolveCheckedGroup = (values: CheckboxChecked[]) =>
  values.some((value) => value !== values[0]) ? 'mixed' : values[0] ?? false;
