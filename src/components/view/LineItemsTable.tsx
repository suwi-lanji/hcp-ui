import { Box, Table, Badge } from '@mantine/core';
import { getFieldLabel } from './fieldRenderers';
import type { LineItemDef } from '@/types/moduleConfig';
import { formatCurrency } from '@/utils/currency';

interface LineItemsTableProps {
  lineItems: LineItemDef;
  data: Record<string, unknown>[];
  parentRow?: Record<string, unknown>;
}

export function LineItemsTable({ lineItems, data, parentRow }: LineItemsTableProps) {
  const total = data.reduce((sum, item) => sum + Number(item.total || item.lineTotal || 0), 0);

  return (
    <Box style={{ overflowX: 'auto' }}>
      <Table withTableBorder withColumnBorders style={{ fontSize: '0.875rem' }}>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ width: 40, fontSize: 11, fontWeight: 700 }}>#</Table.Th>
            {lineItems.fields.map((field) => (
              <Table.Th key={field.key} style={{ fontSize: 11, fontWeight: 700 }}>
                {field.label}
              </Table.Th>
            ))}
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {data.map((item, index) => (
            <Table.Tr key={index}>
              <Table.Td style={{ fontSize: 12 }}>{index + 1}</Table.Td>
              {lineItems.fields.map((field) => {
                const value = item[field.key];
                return (
                  <Table.Td key={field.key} style={{ fontSize: 12 }}>
                    {field.type === 'currency' ? (
                      formatCurrency(value, parentRow)
                    ) : field.type === 'checkbox' ? (
                      <Badge size="xs" variant="light" color={value ? 'green' : 'gray'}>
                        {value ? 'Yes' : 'No'}
                      </Badge>
                    ) : (
                      getFieldLabel(value, field)
                    )}
                  </Table.Td>
                );
              })}
            </Table.Tr>
          ))}
        </Table.Tbody>
        <Table.Tfoot>
          <Table.Tr style={{ background: 'var(--mantine-color-gray-0, #f8f9fa)' }}>
            <Table.Td colSpan={lineItems.fields.length} style={{ textAlign: 'right', fontWeight: 700 }}>
              Total
            </Table.Td>
            <Table.Td style={{ fontWeight: 700 }}>
              {formatCurrency(total, parentRow)}
            </Table.Td>
          </Table.Tr>
        </Table.Tfoot>
      </Table>
    </Box>
  );
}
