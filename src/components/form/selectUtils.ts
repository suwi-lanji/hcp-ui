import type { FieldDef, LineItemFieldDef, SelectOption, SelectOptions } from '../../types/moduleConfig';

export function normalizeOptions(raw: unknown): SelectOption[] {
  if (raw == null) return [];
  if (Array.isArray(raw)) return raw as SelectOption[];
  if (typeof raw === 'object') {
    const o = raw as Partial<SelectOptions>;
    if (Array.isArray(o.static_options)) {
      return o.static_options as SelectOption[];
    }
  }
  return [];
}

export function getSelectDeps(sql: string | null | undefined): string[] {
  if (!sql) return [];
  const deps = new Set<string>();
  let i = 0;
  const n = sql.length;
  const re = /:([A-Za-z_][A-Za-z0-9_]*)/y;
  while (i < n) {
    const c = sql[i];
    if (c === "'") {
      i += 1;
      while (i < n && sql[i] !== "'") {
        if (sql[i] === "'" && i + 1 < n && sql[i + 1] === "'") {
          i += 2;
          continue;
        }
        i += 1;
      }
      i += 1;
      continue;
    }
    if (c === ":" && (i === 0 || !/[A-Za-z0-9_:"]/.test(sql[i - 1] || ""))) {
      re.lastIndex = i;
      const m = re.exec(sql);
      if (m) {
        const end = i + m[0].length;
        if (end + 1 < n && sql[end] === ":" && sql[end + 1] === ":") {
          i = end + 2;
          continue;
        }
        const name = m[1];
        if (name !== "value" && name !== "limit" && name !== "offset") {
          deps.add(name);
        }
        i = end;
        continue;
      }
    }
    i += 1;
  }
  return Array.from(deps);
}

export function isSqlSourceSelect(field: FieldDef | LineItemFieldDef | undefined): boolean {
  if (!field || field.type !== 'select') return false;
  const opts = field.options as SelectOptions | SelectOption[] | undefined;
  if (!opts || Array.isArray(opts)) return false;
  return (opts as SelectOptions).source === 'sql';
}

export function getSelectSql(field: FieldDef | LineItemFieldDef): string {
  const opts = field.options as SelectOptions | SelectOption[] | undefined;
  if (!opts || Array.isArray(opts)) return '';
  return (opts as SelectOptions).sql || '';
}

export function getStaticSelectOptions(field: FieldDef | LineItemFieldDef | undefined): SelectOption[] | null {
  if (!field || field.type !== 'select') return null;
  const opts = field.options as SelectOptions | SelectOption[] | undefined;
  if (!opts) return null;
  if (Array.isArray(opts)) return opts;
  if ((opts as SelectOptions).source === 'static') {
    return ((opts as SelectOptions).static_options as SelectOption[] | undefined) ?? [];
  }
  return null;
}
