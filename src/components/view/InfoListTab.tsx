import { Grid, Text } from '@mantine/core';
import { renderFieldValue } from './fieldRenderers';
import type { FieldDef } from '@/types/moduleConfig';

interface InfoListTabProps {
  fields: FieldDef[];
  data: Record<string, unknown>;
}

export function InfoListTab({ fields, data }: InfoListTabProps) {
  return (
    <Grid>
      {fields.map((field) => (
        <Grid.Col key={field.key} span={{ base: 12, sm: 6, md: 4 }}>
          <div>
            <Text size="xs" fw={500} mb={4} c="dimmed">{field.label}</Text>
            {renderFieldValue(data[field.key], field)}
          </div>
        </Grid.Col>
      ))}
    </Grid>
  );
}
