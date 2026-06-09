import { useState } from 'react';
import { Card, Text, Tabs, Loader, Group } from '@mantine/core';
import { useParams, useSearchParams } from 'react-router-dom';
import { useModuleData } from '@/hooks/useModuleData';
import { useModuleConfig } from '@/hooks/useModuleConfig';
import { ObjectPageHeader } from './ObjectPageHeader';
import { ActionBar } from './ActionBar';
import { InfoListTab } from './InfoListTab';
import { LineItemsTable } from './LineItemsTable';
import { getFieldLabel, statusColorMap } from './fieldRenderers';
import { normalizeOptions } from '../form/selectUtils';
import { useConfig } from '@/hooks/useConfigStore';
import * as Icons from '@tabler/icons-react';

const colorMap: Record<string, string> = {
  orange: '#e9730c',
  blue: '#0854a0',
  green: '#2b7d2b',
  violet: '#6a4e9e',
  teal: '#00857c',
  cyan: '#1a8a8a',
  red: '#c0392b',
  gray: '#6a7a8a',
  yellow: '#e9b90c',
};

export function ModuleView() {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const entityKey = searchParams.get('entity') || '';
  
  const { config: module, loading: moduleLoading } = useModuleConfig(entityKey);
  const { data, loading: dataLoading, error, refetch } = useModuleData(entityKey, id);
  const { apps } = useConfig();
  
  const firstTabKey = module?.tabs?.[0]?.key ?? '';
  const [activeTab, setActiveTab] = useState<string>(firstTabKey);
  const [trackedModuleKey, setTrackedModuleKey] = useState<string | null>(null);
  if (module && module.key !== trackedModuleKey) {
    setTrackedModuleKey(module.key);
    if (activeTab !== firstTabKey) setActiveTab(firstTabKey);
  }

  if (moduleLoading || dataLoading) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">Loading...</Text>
      </Group>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '1rem' }}>
        <Text c="red">{error}</Text>
      </div>
    );
  }

  if (!module) {
    return (
      <div style={{ padding: '1rem' }}>
        <Text>Module not found: {entityKey}</Text>
      </div>
    );
  }

  if (!data) {
    return (
      <Group justify="center" py="xl">
        <Text size="sm" c="dimmed">Record not found</Text>
      </Group>
    );
  }

  const accentColor = colorMap[module.color] || '#0854a0';

  // Find app
  const appEntry = Object.entries(apps).find(([, app]) =>
    (app.entities ?? []).some((e) => e === entityKey)
  );
  const appKey = appEntry?.[0];
  const appLabel = appEntry?.[1]?.label;

  // Identifier field
  const identifierField = module.fields.find((f) =>
    f.key.toLowerCase().includes('number') || f.key === 'code' || f.key === 'sku'
  );
  const identifier = identifierField ? String(data[identifierField.key] || id) : id || '';

  // Title field
  const titleField = module.fields.find((f) =>
    f.key === 'name' || f.key === 'customer' || f.key === 'supplier'
  );
  const title = titleField ? getFieldLabel(data[titleField.key], titleField) : '';

  // Status
  const statusField = module.fields.find((f) => f.key === 'status');
  const statusValue = String(data.status || '');
  const statusLabel = statusField ? normalizeOptions(statusField.options).find((o) => o.value === statusValue)?.label || statusValue : statusValue;
  const statusColor = statusColorMap[statusValue] || 'gray';

  // Quick info
  const quickInfoFields = module.fields
    .filter((f) =>
      ['orderDate', 'invoiceDate', 'billDate', 'quoteDate', 'paymentDate', 'date', 'category', 'quantity'].includes(f.key)
    )
    .slice(0, 3);
  const quickInfo = quickInfoFields.map((f) => ({
    label: f.label,
    value: getFieldLabel(data[f.key], f),
  }));

  return (
    <div style={{ padding: '1rem' }}>
      <ObjectPageHeader
        module={module}
        appKey={appKey}
        appLabel={appLabel}
        identifier={identifier}
        title={title}
        status={statusValue}
        statusLabel={statusLabel}
        statusColor={statusColor}
        accentColor={accentColor}
        quickInfo={quickInfo}
        actions={
          <ActionBar
            module={module}
            itemId={id!}
            itemData={data}
            accentColor={accentColor}
            onRefresh={refetch}
          />
        }
      />

      {module.tabs && module.tabs.length > 0 && (
        <Card shadow="xs" radius="md" withBorder>
          <Tabs value={activeTab} onChange={(v) => setActiveTab(v || '')}>
            <Tabs.List style={{ borderBottom: '1px solid var(--mantine-color-gray-3)', background: 'var(--mantine-color-gray-0)' }}>
              {module.tabs.map((tab) => {
                const TabIcon = tab.icon
                  ? (Icons as unknown as Record<string, React.ComponentType<{ size?: number }>>)[tab.icon]
                  : null;
                return (
                  <Tabs.Tab
                    key={tab.key}
                    value={tab.key}
                    leftSection={TabIcon ? <TabIcon size={16} /> : null}
                    style={{ fontSize: 13, fontWeight: activeTab === tab.key ? 600 : 400 }}
                  >
                    {tab.label}
                  </Tabs.Tab>
                );
              })}
            </Tabs.List>

            {module.tabs.map((tab) => (
              <Tabs.Panel key={tab.key} value={tab.key} p="lg">
                {tab.type === 'infolist' && (
                  <InfoListTab
                    fields={module.fields.filter((f) => tab.fields?.includes(f.key))}
                    data={data}
                  />
                )}
                {tab.type === 'table' && module.lineItems && (
                  <LineItemsTable
                    lineItems={module.lineItems}
                    data={((data as Record<string, unknown>)[tab.lineItemRef || 'lineItems'] as Record<string, unknown>[]) || []}
                  />
                )}
                {tab.type === 'custom' && tab.htmlContent && (
                  <div dangerouslySetInnerHTML={{ __html: tab.htmlContent }} />
                )}
              </Tabs.Panel>
            ))}
          </Tabs>
        </Card>
      )}
    </div>
  );
}
