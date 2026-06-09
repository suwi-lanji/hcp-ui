import { Badge, Text } from '@mantine/core';
import type { FieldDef, LineItemFieldDef } from '@/types/moduleConfig';
import { normalizeOptions } from '../form/selectUtils';
import { formatCurrency } from '@/utils/currency';

export const statusColorMap: Record<string, string> = {
  draft: 'gray',
  pending: 'yellow',
  approved: 'green',
  rejected: 'red',
  active: 'green',
  inactive: 'gray',
  completed: 'blue',
  cancelled: 'red',
  sent: 'blue',
  accepted: 'green',
  converted: 'teal',
  expired: 'orange',
  on_hold: 'yellow',
};

type FieldLike = Pick<FieldDef | LineItemFieldDef, 'options'>;

export function getFieldLabel(value: unknown, field: FieldLike): string {
  if (value === undefined || value === null) return '-';

  const options = normalizeOptions(field.options);
  if (options.length > 0) {
    const option = options.find((o) => o.value === value);
    if (option) return option.label;
  }

  return String(value);
}

export function renderFieldValue(value: unknown, field: FieldDef, row?: Record<string, unknown>) {
  if (value === undefined || value === null) {
    return <Text size="sm" c="dimmed">-</Text>;
  }

  switch (field.type) {
    case 'badge':
      return (
        <Badge size="sm" variant="light" color={statusColorMap[String(value)] || 'gray'}>
          {getFieldLabel(value, field)}
        </Badge>
      );

    case 'currency':
      return (
        <Text size="sm" fw={600}>
          {formatCurrency(value, row)}
        </Text>
      );

    case 'checkbox':
      return (
        <Badge size="sm" variant="light" color={value ? 'green' : 'gray'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );

    case 'select':
      return <Text size="sm" fw={600}>{getFieldLabel(value, field)}</Text>;

    default:
      return <Text size="sm" fw={600}>{getFieldLabel(value, field)}</Text>;
  }
}
