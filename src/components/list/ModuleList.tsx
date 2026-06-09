import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Card, Text, Group, TextInput, Select, Pagination, ActionIcon, Button, Divider, Breadcrumbs, Grid, Collapse, Loader, Table, Badge } from '@mantine/core';
import { IconSearch, IconPlus, IconFilter, IconArrowRight, IconX, IconRefresh } from '@tabler/icons-react';
import { useDisclosure } from '@mantine/hooks';
import { dataApi } from '../../api/endpoints/data';
import { useApps } from '../../hooks/useConfigStore';
import { useModuleConfig } from '../../hooks/useModuleConfig';
import { normalizeOptions } from '../form/selectUtils';
import { formatCurrency } from '../../utils/currency';

const statusColorMap: Record<string, string> = {
  active: 'green', inactive: 'gray', discontinued: 'red', draft: 'gray',
  confirmed: 'blue', processing: 'yellow', shipped: 'cyan', delivered: 'green',
  cancelled: 'red', sent: 'blue', paid: 'green', overdue: 'red', pending: 'orange',
  approved: 'green', submitted: 'blue', received: 'teal', in: 'green', out: 'red',
  transfer: 'blue',
};

interface ListColumn {
  key: string;
  label: string;
  type?: string;
  width?: string;
  sortable?: boolean;
  display?: { type: string; options?: { value: string; label: string }[] };
}


export function ModuleList() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const apps = useApps();
  const entity = searchParams.get('entity') || '';

  const { config: moduleConfig } = useModuleConfig(entity || null);
  const [data, setData] = useState<Record<string, unknown>[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [sortKey, setSortKey] = useState('');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filtersOpened, { toggle: toggleFilters }] = useDisclosure(false);

  const pageSize = moduleConfig?.list?.pageSize || 20;
  const listConfig = moduleConfig?.list;

  const appKey = useMemo(() => {
    if (!entity) return null;
    return Object.entries(apps).find(([, cfg]) => cfg.entities?.includes(entity))?.[0];
  }, [apps, entity]);

  const app = appKey ? apps[appKey] : null;
  const appColor = appKey === 'inventory' ? '#e9730c' : appKey === 'sales' ? '#0854a0' : appKey === 'procurement' ? '#6a4e9e' : '#0854a0';

  const totalPages = Math.ceil(totalItems / pageSize) || 1;

  const fetchData = useCallback(async () => {
    if (!entity || !moduleConfig) return;
    setLoading(true);

    const filterConditions: { field: string; op: string; value: unknown }[] = [];

    if (searchQuery) {
      filterConditions.push({ field: 'name', op: 'ilike', value: `%${searchQuery}%` });
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filterConditions.push({ field: key, op: 'eq', value });
      }
    });

    const orderBy = sortKey ? [{ field: sortKey, direction: sortDir }] : undefined;
    const offset = (page - 1) * pageSize;

    try {
      const result = await dataApi.dataEndpoint(entity, 'list', {
        operation: 'list',
        body: {
          filters: filterConditions.length > 0 ? filterConditions : undefined,
          orderBy,
          limit: pageSize,
          offset,
        },
      });

      const items = (result.data as Record<string, unknown>[]) || [];
      const meta = result.meta as { total?: number } || {};
      setData(items);
      setTotalItems(meta.total || items.length);
    } catch {
      setData([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  }, [entity, moduleConfig, page, pageSize, searchQuery, filters, sortKey, sortDir]);

  // Fetch on mount/config change. The setState calls inside fetchData are async,
  // so this does not cause cascading renders.
  useEffect(() => {
    if (!moduleConfig) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [moduleConfig, fetchData]);

  useEffect(() => {
    if (moduleConfig && !sortKey) {
      const defaultSort = moduleConfig.list?.defaultSort || 'created_at desc';
      const [sort, dir] = defaultSort.split(' ');
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSortKey(sort);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSortDir((dir || 'asc') as 'asc' | 'desc');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [moduleConfig]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        setPage(1);
        fetchData();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters((f) => ({ ...f, [key]: value }));
    setPage(1);
  };

  const handleClearFilters = () => {
    setFilters({});
    setPage(1);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleRefresh = () => {
    fetchData();
  };

  const handleRowClick = (row: Record<string, unknown>) => {
    navigate(`${moduleConfig?.basePath}/${String(row.id)}?entity=${entity}`);
  };

  const renderCell = (value: unknown, col: ListColumn, row: Record<string, unknown>) => {
    if (value === undefined || value === null) return '-';

    const field = moduleConfig?.fields?.find((f) => f.key === col.key);
    const fieldOptions = field ? normalizeOptions(field.options) : [];

    if (col.key === 'status' || col.key === 'type' || col.type === 'badge') {
      const color = statusColorMap[String(value)] || 'gray';
      const label = fieldOptions.find((o) => o.value === value)?.label || String(value);
      return <Badge size="xs" variant="light" color={color}>{label}</Badge>;
    }

    if (col.type === 'currency') {
      return formatCurrency(value, row);
    }

    if (col.type === 'number') {
      return Number(value).toLocaleString();
    }

    if (fieldOptions.length > 0) {
      const opt = fieldOptions.find((o) => o.value === value);
      if (opt) return opt.label;
    }

    const displays = row.__displays as Record<string, string> | undefined;
    if (displays && col.key in displays && displays[col.key]) {
      return displays[col.key];
    }

    return String(value);
  };

  if (!entity) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <Text c="dimmed">No entity specified</Text>
      </div>
    );
  }

  if (!moduleConfig || !listConfig) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">Loading...</Text>
      </Group>
    );
  }

  const activeFilterCount = Object.values(filters).filter(Boolean).length + (searchQuery ? 1 : 0);

  return (
    <div style={{ paddingTop: '1rem', maxWidth: '1600px', margin: '0 auto' }}>
      <Breadcrumbs mb="sm" separatorMargin={4} styles={{ root: { fontSize: 12 } }}>
        <div><Link to="/" style={{ color: 'var(--mantine-color-dimmed)', fontSize: 12, textDecoration: 'none' }}>Home</Link></div>
        {appKey && <div><Link to={`/app/${appKey}`} style={{ color: 'var(--mantine-color-dimmed)', fontSize: 12, textDecoration: 'none' }}>{app?.label}</Link></div>}
        <Text size="xs" fw={600}>{moduleConfig.label}</Text>
      </Breadcrumbs>

      <Group justify="space-between" align="flex-start" mb="md">
        <Group gap="sm">
          <div style={{ width: 36, height: 36, background: appColor, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Text size="xl" c="white"><IconPlus size={22} /></Text>
          </div>
          <div>
            <Text size="xl" fw={800} c="var(--sap-text-color)">{moduleConfig.label}</Text>
            <Text size="sm" style={{ color: 'var(--sap-content-label-color)' }}>{totalItems} records found</Text>
          </div>
        </Group>
        <Group gap="xs">
          <Button
            onClick={() => navigate(`${moduleConfig.basePath}/create?entity=${entity}`)}
            leftSection={<IconPlus size={16} />}
            size="sm"
            style={{ background: appColor }}
          >
            New {moduleConfig.singularLabel}
          </Button>
        </Group>
      </Group>

      <Card shadow="xs" radius="md" withBorder mb="md" style={{ borderColor: 'var(--sap-element-border-color)' }}>
        <Group gap="sm" align="flex-end">
          <TextInput
            placeholder="Search..."
            leftSection={<IconSearch size={16} stroke={1.5} />}
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.currentTarget.value)}
            style={{ flex: 1, maxWidth: 400 }}
            size="sm"
            rightSection={searchQuery ? (
              <ActionIcon variant="subtle" color="gray" size="xs" onClick={() => setSearchQuery('')}>
                <IconX size={12} />
              </ActionIcon>
            ) : null}
          />
          <Button
            variant="outline"
            size="sm"
            leftSection={<IconFilter size={16} />}
            onClick={toggleFilters}
            color={activeFilterCount > 0 ? 'blue' : 'gray'}
          >
            Filters {activeFilterCount > 0 ? `(${activeFilterCount})` : ''}
          </Button>
          <ActionIcon variant="subtle" color="gray" size="lg" title="Refresh" onClick={handleRefresh}>
            <IconRefresh size={18} />
          </ActionIcon>
        </Group>

        <Collapse expanded={filtersOpened}>
          <Divider my="sm" color="var(--sap-element-border-color)" />
          <Grid>
            {listConfig.filters.map((filter) => (
              <Grid.Col key={filter.key} span={{ base: 12, sm: 6, md: 4 }}>
                {filter.type === 'select' ? (
                  <Select
                    label={filter.label}
                    placeholder={`All ${filter.label}`}
                    data={filter.options || []}
                    value={filters[filter.key] || ''}
                    onChange={(val) => handleFilterChange(filter.key, val || '')}
                    clearable
                    size="sm"
                  />
                ) : (
                  <TextInput
                    label={filter.label}
                    placeholder={`Filter by ${filter.label}...`}
                    value={filters[filter.key] || ''}
                    onChange={(e) => handleFilterChange(filter.key, e.currentTarget.value)}
                    size="sm"
                  />
                )}
              </Grid.Col>
            ))}
          </Grid>
          {activeFilterCount > 0 && (
            <Group justify="flex-end" mt="sm">
              <Button variant="subtle" size="xs" onClick={() => { handleClearFilters(); setSearchQuery(''); }}>
                Clear All Filters
              </Button>
            </Group>
          )}
        </Collapse>
      </Card>

      <Card shadow="xs" radius="md" withBorder style={{ borderColor: 'var(--sap-element-border-color)', overflow: 'hidden' }}>
        {loading ? (
          <Group justify="center" py="xl">
            <Loader size="sm" />
            <Text size="sm" c="dimmed">Loading...</Text>
          </Group>
        ) : (
          <Table highlightOnHover>
<Table.Thead>
              <Table.Tr style={{ background: 'var(--sap-list-header-background)' }}>
                {listConfig.columns.map((col) => (
                  <Table.Th
                    key={col.key}
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      cursor: col.sortable !== false ? 'pointer' : 'default',
                      width: col.width,
                      color: 'var(--sap-content-label-color)',
                      borderBottom: '1px solid var(--sap-group-content-border-color)',
                    }}
                    onClick={() => col.sortable !== false && handleSort(col.key)}
                  >
                    <Group gap={4} wrap="nowrap">
                      {col.label}
                      {sortKey === col.key && (
                        <Text size="xs" c="blue">{sortDir === 'asc' ? '↑' : '↓'}</Text>
                      )}
                    </Group>
                  </Table.Th>
                ))}
                <Table.Th style={{ width: 40, borderBottom: '1px solid var(--sap-group-content-border-color)' }}></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {data.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={listConfig.columns.length + 1}>
                    <Text ta="center" c="dimmed" py="xl" size="sm">No records found</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                data.map((row, idx) => (
                  <Table.Tr key={idx} style={{ cursor: 'pointer' }} onClick={() => handleRowClick(row)}>
                    {listConfig.columns.map((col) => (
                      <Table.Td
                        key={col.key}
                        style={{ fontSize: 13, borderBottomColor: 'var(--sap-element-border-color)' }}
                      >
                        {renderCell(row[col.key], col, row)}
                      </Table.Td>
                    ))}
                    <Table.Td style={{ borderBottomColor: 'var(--sap-element-border-color)' }}>
                      <ActionIcon variant="subtle" color="gray" size="sm">
                        <IconArrowRight size={14} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        )}
      </Card>

      <Group justify="space-between" mt="md">
        <Text size="sm" style={{ color: 'var(--sap-content-label-color)' }}>
          {loading ? 'Loading...' : totalItems === 0 ? 'No records' : `Showing ${(page - 1) * pageSize + 1}-${Math.min(page * pageSize, totalItems)} of ${totalItems}`}
        </Text>
        <Pagination
          total={Math.max(1, totalPages)}
          value={page}
          onChange={setPage}
          size="sm"
          withEdges
          color="blue"
        />
      </Group>
    </div>
  );
}