import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Text, Group, SimpleGrid, UnstyledButton, Center, Loader, Stack, Badge, Table, ActionIcon, Box } from '@mantine/core';
import { IconPlus, IconArrowRight, IconBox } from '@tabler/icons-react';
import { configApi } from '../../api/endpoints/config';
import { dataApi } from '../../api/endpoints/data';
import { useApps } from '../../hooks/useConfigStore';
import AnalyticalTile from '../shared/AnalyticalTile';

const appColors: Record<string, string> = {
  inventory: '#e9730c',
  sales: '#0854a0',
  procurement: '#6a4e9e',
  accounting: '#0854a0',
  settings: '#6a6a6a',
};

const statusColors: Record<string, string> = {
  active: 'green', inactive: 'gray', discontinued: 'red', draft: 'gray',
  confirmed: 'blue', processing: 'yellow', shipped: 'cyan', delivered: 'green',
  cancelled: 'red', sent: 'blue', paid: 'green', overdue: 'red', pending: 'orange',
  approved: 'green', submitted: 'blue', received: 'teal', in: 'green', out: 'red',
  transfer: 'blue',
};

interface StatCard {
  title: string;
  value: string;
  icon: string;
  color: string;
  trend?: string;
  trendValue?: string;
  subtitle?: string;
  kpiUnit?: string;
  kpiState?: string;
  subValues?: { label: string; value: string }[];
  timeframe?: string;
}

interface RecentTableColumn {
  key: string;
  label: string;
  type?: string;
}

interface DashboardConfig {
  statCards: StatCard[];
  recentTable?: {
    title: string;
    columns: RecentTableColumn[];
  };
}

interface ModuleConfig {
  key: string;
  label: string;
  singularLabel: string;
  icon: string;
  basePath: string;
  appKey: string;
  dashboard: DashboardConfig;
  fields?: { key: string; options?: { value: string; label: string }[] }[];
}

export function Dashboard() {
  const { appKey } = useParams<{ appKey: string }>();
  const navigate = useNavigate();
  const apps = useApps();

  const [moduleConfig, setModuleConfig] = useState<ModuleConfig | null>(null);
  const [recentItems, setRecentItems] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);

  const isAppsLoading = Object.keys(apps).length === 0;
  const app = apps[appKey || ''];
  const appColor = appColors[appKey || ''] || '#0854a0';

  useEffect(() => {
    if (!appKey || !app?.entities?.[0]) return;

    const entity = app.entities[0];
    let cancelled = false;

    configApi.getModule(entity).then((mod) => {
      if (cancelled) return;
      setModuleConfig(mod as unknown as ModuleConfig);

      if ((mod as unknown as ModuleConfig).dashboard?.recentTable) {
        dataApi.dataEndpoint(entity, 'list', { operation: 'list', params: { limit: 5 } })
          .then((d) => {
            if (cancelled) return;
            const items = (d.data as Record<string, unknown>[]) || [];
            setRecentItems(items);
            setLoading(false);
          })
          .catch(() => {
            if (cancelled) return;
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }).catch(() => {
      if (cancelled) return;
      setLoading(false);
    });

    return () => { cancelled = true; };
  }, [appKey, app]);

  if (isAppsLoading) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  if (!app) {
    return (
      <Center py="xl">
        <Text c="dimmed">App not found: {appKey}</Text>
      </Center>
    );
  }

  const dashboard = moduleConfig?.dashboard;
  const recentTable = dashboard?.recentTable;
  const statCards = dashboard?.statCards || [];
  const primaryEntity = app.entities?.[0];

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1600px', margin: '0 auto' }}>
      <Stack gap="lg">
        <Group justify="space-between" align="center">
          <Group gap="md">
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 8,
                background: appColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBox size={24} color="white" />
            </div>
            <div>
              <Text size="xl" fw={600} c="var(--sap-text-color)">
                {app.label}
              </Text>
              <Text size="sm" c="dimmed">
                Overview and insights for {app.label.toLowerCase()} management
              </Text>
            </div>
          </Group>
          {primaryEntity && (
            <UnstyledButton
              onClick={() => navigate(`/app/${appKey}/create?entity=${primaryEntity}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 16px',
                borderRadius: 6,
                background: appColor,
                color: 'white',
                fontSize: 13,
                fontWeight: 600,
                transition: 'background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = appColor + 'dd';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = appColor;
              }}
            >
              <IconPlus size={16} />
              New {moduleConfig?.singularLabel || primaryEntity}
            </UnstyledButton>
          )}
        </Group>

        {statCards.length > 0 && (
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="sm">
            {statCards.map((stat) => (
              <AnalyticalTile
                key={stat.title}
                title={stat.title}
                subtitle={stat.subtitle as string}
                kpiValue={stat.value}
                kpiUnit={stat.kpiUnit}
                kpiState={(stat.kpiState as 'Positive' | 'Negative' | 'Critical' | 'Information' | 'None') || 'None'}
                icon={stat.icon}
                subValues={stat.subValues}
                timeframe={stat.timeframe}
                onClick={undefined}
              />
            ))}
          </SimpleGrid>
        )}

        {recentTable && (
          <Box mb="lg">
            <Card shadow="xs" radius="md" withBorder style={{ borderColor: 'var(--sap-element-border-color)', overflow: 'hidden' }}>
              <Group justify="space-between" align="center" p="md" style={{ borderBottom: '1px solid var(--sap-element-border-color)', background: 'var(--sap-list-header-background)' }}>
                <Text size="sm" fw={600} c="var(--sap-text-color)">{recentTable.title}</Text>
                {primaryEntity && (
                  <UnstyledButton
                    onClick={() => navigate(`/app/${appKey}/list?entity=${primaryEntity}`)}
                    style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--sap-informative-color)', fontWeight: 500 }}
                  >
                    View all <IconArrowRight size={12} />
                  </UnstyledButton>
                )}
              </Group>
              {loading ? (
                <Group justify="center" py="xl">
                  <Loader size="sm" />
                  <Text size="sm" c="dimmed">Loading recent items...</Text>
                </Group>
              ) : (
                <Table highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      {recentTable.columns.map((col) => (
                        <Table.Th key={col.key} style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--sap-content-label-color)', borderBottom: '1px solid var(--sap-group-content-border-color)' }}>
                          {col.label}
                        </Table.Th>
                      ))}
                      <Table.Th style={{ width: 40 }}></Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentItems.slice(0, 5).map((row, idx) => (
                      <Table.Tr key={idx} style={{ cursor: 'pointer' }}>
                        {recentTable.columns.map((col) => (
                          <Table.Td key={col.key} style={{ fontSize: 13, borderBottomColor: 'var(--sap-element-border-color)' }}>
                            {col.key === 'status' || col.key === 'type' ? (
                              <Badge size="xs" variant="light" color={statusColors[String(row[col.key])] || 'gray'}>
                                {String(row[col.key] || '')}
                              </Badge>
                            ) : col.type === 'currency' ? (
                              `$${Number(row[col.key]).toLocaleString()}`
                            ) : (
                              String(row[col.key] || '')
                            )}
                          </Table.Td>
                        ))}
                        <Table.Td>
                          <ActionIcon variant="subtle" color="gray" size="sm">
                            <IconArrowRight size={14} />
                          </ActionIcon>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              )}
            </Card>
          </Box>
        )}
      </Stack>
    </div>
  );
}