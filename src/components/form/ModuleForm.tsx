import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom';
import {
  Card, TextInput, Select, Textarea, NumberInput, Switch,
  Group, Text, Badge, Breadcrumbs, Button, Grid, Box, ActionIcon, Table, Collapse, Loader,
  Tabs,
} from '@mantine/core';
import { IconArrowLeft, IconDeviceFloppy, IconPlus, IconTrash, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { dataApi } from '../../api/endpoints/data';
import { useModuleConfig } from '../../hooks/useModuleConfig';
import { useApps } from '../../hooks/useConfigStore';
import type { FieldDef, LineItemFieldDef, ModuleConfig, SelectOption } from '../../types/moduleConfig';
import {
  getSelectDeps,
  getSelectSql,
  getStaticSelectOptions,
  isSqlSourceSelect,
  normalizeOptions,
} from './selectUtils';

interface FormProps {
  mode: 'create' | 'edit';
}

const colorMap: Record<string, string> = {
  orange: '#e9730c', blue: '#0854a0', green: '#2b7d2b', violet: '#6a4e9e',
  teal: '#00857c', cyan: '#1a8a8a', red: '#c0392b', gray: '#6a7a8a', yellow: '#e9b90c',
};

type OptionsResolver = (key: string, values: Record<string, unknown>, scope: string) => {
  options: SelectOption[];
  loading: boolean;
};

function useSelectOptionsResolver(
  entity: string,
  fields: FieldDef[],
  lineItemFields: LineItemFieldDef[] | undefined,
  values: Record<string, unknown>,
  lineItems: Record<string, unknown>[]
): OptionsResolver {
  const [cache, setCache] = useState<Record<string, { options: SelectOption[]; loading: boolean }>>({});
  const inflight = useRef<Set<string>>(new Set());

  const allSelectable = useMemo(() => {
    const arr: { key: string; deps: string[]; scope: string }[] = [];
    for (const f of fields) {
      if (!isSqlSourceSelect(f)) continue;
      const sql = getSelectSql(f);
      const deps = getSelectDeps(sql).filter((d) => !d.endsWith(f.key) && d !== f.key.replace(/_id$/, ''));
      arr.push({ key: f.key, deps, scope: 'main' });
    }
    if (lineItemFields) {
      for (const f of lineItemFields) {
        if (!isSqlSourceSelect(f)) continue;
        const sql = getSelectSql(f);
        const deps = getSelectDeps(sql).filter((d) => !d.endsWith(f.key) && d !== f.key.replace(/_id$/, ''));
        arr.push({ key: f.key, deps, scope: 'line' });
      }
    }
    return arr;
  }, [fields, lineItemFields]);

  useEffect(() => {
    if (!entity || allSelectable.length === 0) return;
    for (const { key, deps, scope } of allSelectable) {
      let boundValues: Record<string, unknown> = {};
      let cacheKey: string;
      if (scope === 'main') {
        for (const d of deps) boundValues[d] = values[d];
        if (deps.some((d) => values[d] === undefined || values[d] === '' || values[d] === null)) continue;
        cacheKey = `main:${key}:${JSON.stringify(boundValues)}`;
      } else {
        boundValues = { ...values };
        for (const li of lineItems) {
          for (const d of deps) {
            if (li[d] !== undefined) boundValues[d] = li[d];
          }
        }
        if (deps.some((d) => boundValues[d] === undefined || boundValues[d] === '' || boundValues[d] === null)) continue;
        cacheKey = `line:${key}:${JSON.stringify(boundValues)}`;
      }
      if (cache[cacheKey] || inflight.current.has(cacheKey)) continue;
      inflight.current.add(cacheKey);
      setCache((prev) => ({ ...prev, [cacheKey]: { options: prev[cacheKey]?.options || [], loading: true } }));
      dataApi
        .selectOptions(entity, key, boundValues as Record<string, string | number | null>)
        .then((options) => {
          inflight.current.delete(cacheKey);
          setCache((prev) => ({ ...prev, [cacheKey]: { options, loading: false } }));
        })
        .catch(() => {
          inflight.current.delete(cacheKey);
          setCache((prev) => ({ ...prev, [cacheKey]: { options: [], loading: false } }));
        });
    }
  }, [entity, allSelectable, values, lineItems, cache]);

  return useCallback(
    (key: string, _values: Record<string, unknown>, scope: string) => {
      const entry = allSelectable.find((s) => s.key === key && s.scope === scope);
      if (!entry) {
        return { options: [], loading: false };
      }
      let bound: Record<string, unknown> = {};
      if (scope === 'main') {
        for (const d of entry.deps) bound[d] = values[d];
        if (entry.deps.some((d) => values[d] === undefined || values[d] === '' || values[d] === null)) {
          return { options: [], loading: false };
        }
      } else {
        bound = { ...values };
        for (const li of lineItems) {
          for (const d of entry.deps) {
            if (li[d] !== undefined) bound[d] = li[d];
          }
        }
        if (entry.deps.some((d) => bound[d] === undefined || bound[d] === '' || bound[d] === null)) {
          return { options: [], loading: false };
        }
      }
      const cacheKey = `${scope}:${key}:${JSON.stringify(bound)}`;
      return cache[cacheKey] || { options: [], loading: true };
    },
    [allSelectable, values, lineItems, cache]
  );
}

function renderField(
  f: FieldDef,
  value: unknown,
  onChange: (key: string, val: unknown) => void,
  disabled = false,
  resolver?: OptionsResolver,
  loading = false,
) {
  if (f.hidden) return null;

  const commonProps = {
    label: f.label,
    required: f.required,
    placeholder: f.placeholder,
    disabled: disabled || f.readonly,
    size: 'sm' as const,
  };

  switch (f.type) {
    case 'select': {
      const staticOpts = getStaticSelectOptions(f);
      let data: SelectOption[];
      if (staticOpts !== null) {
        data = staticOpts;
      } else if (resolver) {
        data = resolver(f.key, value && typeof value === 'object' ? (value as Record<string, unknown>) : {}, 'main').options;
      } else {
        data = normalizeOptions(f.options);
      }
      return (
        <Select
          {...commonProps}
          data={data}
          value={value == null ? '' : String(value)}
          onChange={(v) => onChange(f.key, v)}
          searchable
          clearable
          rightSection={loading ? <Loader size="xs" /> : undefined}
        />
      );
    }
    case 'number':
      return (
        <NumberInput
          {...commonProps}
          value={value ? Number(value) : undefined}
          onChange={(v) => onChange(f.key, v)}
          min={0}
        />
      );
    case 'currency':
      return (
        <NumberInput
          {...commonProps}
          value={value ? Number(value) : undefined}
          onChange={(v) => onChange(f.key, v)}
          decimalScale={2}
          min={0}
        />
      );
    case 'textarea':
      return (
        <Textarea
          {...commonProps}
          value={String(value || '')}
          onChange={(e) => onChange(f.key, e.currentTarget.value)}
          autosize
          minRows={2}
          maxRows={4}
        />
      );
    case 'checkbox':
      return (
        <Switch
          label={f.label}
          checked={Boolean(value)}
          onChange={(e) => onChange(f.key, e.currentTarget.checked)}
          size="sm"
          mt={26}
        />
      );
    case 'date':
      return (
        <TextInput
          {...commonProps}
          type="date"
          value={String(value || '')}
          onChange={(e) => onChange(f.key, e.currentTarget.value)}
        />
      );
    case 'email':
    case 'phone':
      return (
        <TextInput
          {...commonProps}
          type={f.type === 'email' ? 'email' : 'tel'}
          value={String(value || '')}
          onChange={(e) => onChange(f.key, e.currentTarget.value)}
        />
      );
    case 'badge':
      return (
        <Box>
          <Text size="xs" c="dimmed" mb={4}>{f.label}</Text>
          <Badge
            color={value === 'active' ? 'green' : value === 'inactive' ? 'red' : value === 'on_hold' ? 'orange' : 'gray'}
            variant="light"
            size="sm"
          >
            {String(value || '')}
          </Badge>
        </Box>
      );
    default:
      return (
        <TextInput
          {...commonProps}
          value={String(value || '')}
          onChange={(e) => onChange(f.key, e.currentTarget.value)}
        />
      );
  }
}

function renderGrid(
  fields: FieldDef[],
  values: Record<string, unknown>,
  onChange: (k: string, v: unknown) => void,
  disabled = false,
  resolver?: OptionsResolver,
  loadingKeys: Set<string> = new Set(),
) {
  return (
    <Grid>
      {fields.filter(f => !f.hidden).map((f) => (
        <Grid.Col key={f.key} span={{ base: 12, sm: f.width === '100%' ? 12 : 6 }}>
          {renderField(f, values[f.key], onChange, disabled, resolver, loadingKeys.has(f.key))}
        </Grid.Col>
      ))}
    </Grid>
  );
}

function renderSections(
  config: ModuleConfig,
  values: Record<string, unknown>,
  onChange: (k: string, v: unknown) => void,
  collapsed: Record<string, boolean>,
  setCollapsed: (c: Record<string, boolean>) => void,
  disabled = false,
  resolver?: OptionsResolver,
  loadingKeys: Set<string> = new Set(),
) {
  const { formLayout } = config;
  if (!formLayout?.sections) return null;

  return (
    <>
 {formLayout.sections.map((sec) => {
        const isCollapsed = collapsed[sec.key] ?? false;
        const canCollapse = sec.collapsible ?? false;
        const fields = sec.fields
          .map((k) => config.fields.find((f) => f.key === k))
          .filter(Boolean) as FieldDef[];

        return (
          <Card key={sec.key} shadow="xs" radius="md" withBorder mb="md" style={{ overflow: 'hidden' }}>
            <Box
              onClick={canCollapse ? () => { const next = { ...collapsed, [sec.key]: !collapsed[sec.key] }; setCollapsed(next); } : undefined}
              style={{
                cursor: canCollapse ? 'pointer' : 'default',
                padding: '12px 16px',
                background: 'var(--sap-list-header-background)',
                borderBottom: canCollapse ? (isCollapsed ? 'none' : '1px solid var(--sap-element-border-color)') : '1px solid var(--sap-element-border-color)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Group gap="sm">
                <div style={{
                  width: 28, height: 28, background: colorMap[config.color] || '#0854a0',
                  borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Text size="sm" c="white">{sec.label.charAt(0)}</Text>
                </div>
                <div>
                  <Text size="sm" fw={600}>{sec.label}</Text>
                  {sec.description && <Text size="xs" c="dimmed">{sec.description}</Text>}
                </div>
              </Group>
              {canCollapse && (
                <ActionIcon variant="subtle" color="gray" size="sm">
                  {isCollapsed ? <IconChevronDown size={16} /> : <IconChevronUp size={16} />}
                </ActionIcon>
              )}
            </Box>
            <Collapse expanded={!isCollapsed}>
              <Box p="lg">{renderGrid(fields, values, onChange, disabled, resolver, loadingKeys)}</Box>
            </Collapse>
          </Card>
        );
      })}
    </>
  );
}

function renderTabs(
  config: ModuleConfig,
  values: Record<string, unknown>,
  onChange: (k: string, v: unknown) => void,
  disabled = false,
  resolver?: OptionsResolver,
  loadingKeys: Set<string> = new Set(),
) {
  const { formLayout } = config;
  if (!formLayout?.tabs) return null;

  return (
    <Tabs defaultValue={formLayout.tabs[0]?.key}>
      <Tabs.List>
        {formLayout.tabs.map((tab) => (
          <Tabs.Tab key={tab.key} value={tab.key}>
            {tab.label}
          </Tabs.Tab>
        ))}
      </Tabs.List>
      {formLayout.tabs.map((tab) => {
        const fields = tab.fields
          .map((k) => config.fields.find((f) => f.key === k))
          .filter(Boolean) as FieldDef[];

        return (
          <Tabs.Panel key={tab.key} value={tab.key} p="md">
            <Card shadow="xs" radius="md" withBorder>
              {renderGrid(fields, values, onChange, disabled, resolver, loadingKeys)}
            </Card>
          </Tabs.Panel>
        );
      })}
    </Tabs>
  );
}

function renderFlat(
  config: ModuleConfig,
  values: Record<string, unknown>,
  onChange: (k: string, v: unknown) => void,
  disabled = false,
  resolver?: OptionsResolver,
  loadingKeys: Set<string> = new Set(),
) {
  return (
    <Card shadow="xs" radius="md" withBorder p="lg" mb="md">
      <Text size="sm" fw={600} mb="md">General Information</Text>
      {renderGrid(config.fields, values, onChange, disabled, resolver, loadingKeys)}
    </Card>
  );
}

function renderLineItems(
  config: ModuleConfig,
  items: Record<string, unknown>[],
  onUpdate: (i: number, k: string, v: unknown) => void,
  onAdd: () => void,
  onRemove: (i: number) => void,
  resolver?: OptionsResolver,
  lineLoadingKeys: Set<string> = new Set(),
) {
  const { lineItems } = config;
  if (!lineItems) return null;

  return (
    <Card shadow="xs" radius="md" withBorder p="lg" mb="md">
      <Group justify="space-between" mb="md">
        <Text size="sm" fw={600}>{lineItems.label}</Text>
        <Button size="xs" variant="light" leftSection={<IconPlus size={14} />} onClick={onAdd}>
          Add Line
        </Button>
      </Group>
      <Box style={{ overflowX: 'auto' }}>
        <Table withTableBorder withColumnBorders style={{ minWidth: 700, fontSize: '0.75rem' }}>
          <Table.Thead>
            <Table.Tr style={{ background: 'var(--sap-list-header-background)' }}>
              {lineItems.fields.map((f) => (
                <Table.Th key={f.key} style={{ width: f.width, fontSize: 11, fontWeight: 700 }}>
                  {f.label}
                </Table.Th>
              ))}
              <Table.Th style={{ width: 40 }}></Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {items.map((item, i) => (
              <Table.Tr key={i}>
                {lineItems.fields.map((f) => (
                  <Table.Td key={f.key} style={{ padding: '4px 6px' }}>
                    {f.computed ? (
                      <Text size="xs" fw={600}>
                        ${Number(item[f.key] || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </Text>
                    ) : f.type === 'select' ? (
                      (() => {
                        const staticOpts = getStaticSelectOptions(f as LineItemFieldDef);
                        let data: SelectOption[];
                        if (staticOpts !== null) {
                          data = staticOpts;
                        } else if (resolver) {
                          data = resolver(f.key, item, 'line').options;
                        } else {
                          data = normalizeOptions(f.options);
                        }
                        return (
                          <Select
                            data={data}
                            value={item[f.key] == null ? '' : String(item[f.key])}
                            onChange={(v) => onUpdate(i, f.key, v)}
                            size="xs"
                            styles={{ input: { fontSize: 12, height: 28, minHeight: 28 } }}
                            rightSection={lineLoadingKeys.has(f.key) ? <Loader size="xs" /> : undefined}
                          />
                        );
                      })()
                    ) : f.type === 'number' || f.type === 'currency' ? (
                      <NumberInput
                        value={Number(item[f.key] || 0)}
                        onChange={(v) => onUpdate(i, f.key, v)}
                        size="xs"
                        min={0}
                        decimalScale={f.type === 'currency' ? 2 : 0}
                        styles={{ input: { fontSize: 12, height: 28, minHeight: 28 } }}
                      />
                    ) : (
                      <TextInput
                        value={String(item[f.key] || '')}
                        onChange={(e) => onUpdate(i, f.key, e.currentTarget.value)}
                        size="xs"
                        styles={{ input: { fontSize: 12, height: 28, minHeight: 28 } }}
                      />
                    )}
                  </Table.Td>
                ))}
                <Table.Td style={{ padding: '4px' }}>
                  <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onRemove(i)}>
                    <IconTrash size={14} />
                  </ActionIcon>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
      </Box>
    </Card>
  );
}

export function ModuleForm({ mode }: FormProps) {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const entity = searchParams.get('entity') || '';
  const recordId = params.id;

  const { config: moduleConfig, loading, error } = useModuleConfig(entity);
  const apps = useApps();

  const [formValues, setFormValues] = useState<Record<string, unknown>>({});
  const [lineItems, setLineItems] = useState<Record<string, unknown>[]>([]);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [fetchingRecord, setFetchingRecord] = useState(mode === 'edit');

  const appKey = moduleConfig?.appKey || Object.entries(apps).find(([, cfg]) => cfg.entities?.includes(entity))?.[0];
  const app = appKey ? apps[appKey] : null;
  const accentColor = moduleConfig ? (colorMap[moduleConfig.color] || '#0854a0') : '#0854a0';

  useEffect(() => {
    if (!moduleConfig) return;

    if (mode === 'edit' && recordId) {
      let cancelled = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFetchingRecord(true);
      dataApi.dataEndpoint(entity, 'read', { operation: 'read', params: { id: recordId } })
        .then((result: Record<string, unknown>) => {
          if (cancelled) return;
          if (result.data) {
            setFormValues(result.data as Record<string, unknown>);
            if (result.data && typeof result.data === 'object' && 'lineItems' in result.data) {
              setLineItems((result.data.lineItems as Record<string, unknown>[]) || []);
            }
          }
        })
        .catch(() => {
          if (cancelled) return;
          notifications.show({ title: 'Error', message: 'Failed to load record', color: 'red' });
        })
        .finally(() => {
          if (cancelled) return;
          setFetchingRecord(false);
        });
      return () => { cancelled = true; };
    } else {
      const vals: Record<string, unknown> = {};
      for (const f of moduleConfig.fields) {
        vals[f.key] = f.type === 'checkbox' ? false : '';
      }
      setFormValues(vals);
      if (moduleConfig.lineItems) {
        setLineItems([{}]);
      }
    }

    if (moduleConfig.formLayout?.type === 'sections' && moduleConfig.formLayout.sections) {
      const s: Record<string, boolean> = {};
      for (const sec of moduleConfig.formLayout.sections) {
        s[sec.key] = sec.defaultOpen === false;
      }
      setCollapsed(s);
    }
  }, [moduleConfig, mode, recordId, entity]);

  const handleChange = useCallback((key: string, val: unknown) => {
    setFormValues((prev) => ({ ...prev, [key]: val }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!moduleConfig) return;
    setSubmitting(true);

    try {
      const payload = { ...formValues, lineItems };
      const operation = mode === 'create' ? 'create' : 'update';
      const result = await dataApi.dataEndpoint(entity, operation, { operation, ...(mode === 'edit' ? { params: { id: recordId! } } : {}), body: payload });

      if (result.error) {
        notifications.show({
          title: 'Error',
          message: (result.error as { message?: string }).message || 'Failed to save',
          color: 'red',
        });
        return;
      }

      notifications.show({
        title: 'Success',
        message: `${moduleConfig.singularLabel} ${mode === 'create' ? 'created' : 'updated'}`,
        color: 'green',
      });

      navigate(`${moduleConfig.basePath}/list?entity=${entity}`);
    } catch {
      notifications.show({ title: 'Error', message: 'Failed to save', color: 'red' });
    } finally {
      setSubmitting(false);
    }
  }, [moduleConfig, mode, recordId, entity, formValues, lineItems, navigate]);

  const updateLineItem = useCallback((i: number, k: string, v: unknown) => {
    setLineItems((prev) => {
      const u = [...prev];
      u[i] = { ...u[i], [k]: v };
      return u;
    });
  }, []);

  const addLineItem = useCallback(() => {
    setLineItems((prev) => [...prev, {}]);
  }, []);

  const removeLineItem = useCallback((i: number) => {
    setLineItems((prev) => prev.filter((_, idx) => idx !== i));
  }, []);

  const resolver = useSelectOptionsResolver(
    entity,
    moduleConfig?.fields || [],
    moduleConfig?.lineItems?.fields,
    formValues,
    lineItems
  );

  const mainLoadingKeys = useMemo(() => {
    const set = new Set<string>();
    for (const f of moduleConfig?.fields || []) {
      if (f.type !== 'select') continue;
      const r = resolver(f.key, {}, 'main');
      if (r.loading) set.add(f.key);
    }
    return set;
  }, [resolver, moduleConfig]);

  const lineLoadingKeys = useMemo(() => {
    const set = new Set<string>();
    for (const f of moduleConfig?.lineItems?.fields || []) {
      if (f.type !== 'select') continue;
      const r = resolver(f.key, {}, 'line');
      if (r.loading) set.add(f.key);
    }
    return set;
  }, [resolver, moduleConfig]);

  if (!entity) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <Text c="dimmed">No entity specified</Text>
      </div>
    );
  }

  if (loading || fetchingRecord) {
    return (
      <Group justify="center" py="xl">
        <Loader size="sm" />
        <Text size="sm" c="dimmed">Loading...</Text>
      </Group>
    );
  }

  if (error || !moduleConfig) {
    return (
      <div style={{ padding: '1.5rem' }}>
        <Text c="red">{error || 'Module not found'}</Text>
      </div>
    );
  }

  const renderFormLayout = () => {
    const layout = moduleConfig.formLayout;
    if (!layout || layout.type === 'flat') {
      return renderFlat(moduleConfig, formValues, handleChange, false, resolver, mainLoadingKeys);
    }
    if (layout.type === 'sections') {
      return renderSections(moduleConfig, formValues, handleChange, collapsed, setCollapsed, false, resolver, mainLoadingKeys);
    }
    if (layout.type === 'tabs') {
      return renderTabs(moduleConfig, formValues, handleChange, false, resolver, mainLoadingKeys);
    }
    return renderFlat(moduleConfig, formValues, handleChange, false, resolver, mainLoadingKeys);
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1600px', margin: '0 auto' }}>
      <Breadcrumbs mb="sm" separatorMargin={4} styles={{ root: { fontSize: 12 } }}>
        <Link to="/" style={{ color: 'var(--mantine-color-dimmed)', fontSize: 12, textDecoration: 'none' }}>Home</Link>
        {appKey && (
          <Link to={`/app/${appKey}`} style={{ color: 'var(--mantine-color-dimmed)', fontSize: 12, textDecoration: 'none' }}>
            {app?.label}
          </Link>
        )}
        <Link to={`${moduleConfig.basePath}/list?entity=${entity}`} style={{ color: 'var(--mantine-color-dimmed)', fontSize: 12, textDecoration: 'none' }}>
          {moduleConfig.label}
        </Link>
        <Text size="xs" fw={600}>
          {mode === 'create' ? `New ${moduleConfig.singularLabel}` : `Edit ${moduleConfig.singularLabel}`}
        </Text>
      </Breadcrumbs>

      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <div style={{
            width: 36, height: 36, background: accentColor, borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Text size="xl" c="white">{moduleConfig.icon.charAt(0).toUpperCase()}</Text>
          </div>
          <div>
            <Group gap="xs">
              <Text size="xl" fw={800}>
                {mode === 'create' ? `New ${moduleConfig.singularLabel}` : `Edit ${moduleConfig.singularLabel}`}
              </Text>
              {moduleConfig.formLayout && (
                <Badge size="xs" variant="light">{moduleConfig.formLayout.type}</Badge>
              )}
            </Group>
            <Text size="sm" c="dimmed">
              {mode === 'create'
                ? `Create a new ${moduleConfig.singularLabel.toLowerCase()}`
                : `Modify ${moduleConfig.singularLabel.toLowerCase()} details`}
            </Text>
          </div>
        </Group>
        <Group gap="xs">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`${moduleConfig.basePath}/list?entity=${entity}`)}
            leftSection={<IconArrowLeft size={16} />}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            leftSection={<IconDeviceFloppy size={16} />}
            style={{ background: accentColor }}
            onClick={handleSubmit}
            loading={submitting}
          >
            {mode === 'create' ? 'Create' : 'Save'}
          </Button>
        </Group>
      </Group>

      {renderFormLayout()}

      {moduleConfig.lineItems && renderLineItems(
        moduleConfig,
        lineItems,
        updateLineItem,
        addLineItem,
        removeLineItem,
        resolver,
        lineLoadingKeys
      )}
    </div>
  );
}
