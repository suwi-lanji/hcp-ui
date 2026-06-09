export type FieldType = 'text' | 'number' | 'select' | 'date' | 'textarea' | 'checkbox' | 'currency' | 'email' | 'phone' | 'badge';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectOptions {
  source: 'static' | 'sql';
  static_options?: SelectOption[];
  sql?: string;
  params?: Record<string, string>;
}

export interface ValidationRule {
  type: 'min' | 'max' | 'minLength' | 'maxLength' | 'regex' | 'requiredIf';
  value: string | number;
  message: string;
  condition?: string;
}

export interface ReactiveRule {
  when: string;
  set: Record<string, string | number | boolean>;
}

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: SelectOption[];
  hidden: boolean;
  readonly: boolean;
  width?: string;
  reactive?: ReactiveRule[];
  badgeColor?: string;
  sortable: boolean;
  filterable: boolean;
  filterType?: 'select' | 'text' | 'dateRange';
  filterOptions?: SelectOption[];
  display?: { type: 'direct' | 'sql'; sql?: string; contexts?: Record<string, string> };
  validate?: ValidationRule[];
  defaultValue?: string;
}

export interface LineItemFieldDef {
  key: string;
  label: string;
  type: FieldType;
  width?: string;
  options?: SelectOption[] | SelectOptions;
  display?: { type: 'direct' | 'sql'; sql?: string };
  computed: boolean;
  formula?: string;
}

export interface LineItemDef {
  name: string;
  label: string;
  fields: LineItemFieldDef[];
}

export interface TabDef {
  key: string;
  label: string;
  icon?: string;
  type: 'infolist' | 'table' | 'custom';
  fields: string[];
  lineItemRef?: string;
  customComponent?: string;
  htmlContent?: string;
}

export type FormLayoutType = 'flat' | 'sections' | 'tabs' | 'fieldsets' | 'wizard';

export interface FormTabDef {
  key: string;
  label: string;
  icon?: string;
  fields: string[];
}

export interface FormSectionDef {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  collapsible: boolean;
  defaultOpen: boolean;
  fields: string[];
}

export interface FormFieldsetDef {
  key: string;
  label: string;
  description?: string;
  fields: string[];
}

export interface FormWizardStepDef {
  key: string;
  label: string;
  description?: string;
  icon?: string;
  fields: string[];
}

export interface FormLayoutDef {
  type: FormLayoutType;
  tabs?: FormTabDef[];
  sections?: FormSectionDef[];
  fieldsets?: FormFieldsetDef[];
  wizard?: FormWizardStepDef[];
}

export interface ListColumn {
  key: string;
  label: string;
  type?: FieldType;
  width?: string;
  badgeColor?: string;
  sortable: boolean;
  display?: { type: 'direct' | 'sql'; sql?: string };
}

export interface ListFilter {
  key: string;
  label: string;
  type: 'select' | 'text' | 'dateRange';
  options?: SelectOption[];
}

export interface ListConfig {
  defaultSort: string;
  columns: ListColumn[];
  filters: ListFilter[];
  pageSize: number;
}

export interface StatCard {
  title: string;
  value: { static?: string; compute?: { sql: string; params: string[] } };
  icon: string;
  color: string;
  trend?: { static?: string; compute?: { sql: string; params: string[] } };
  trendValue?: { static?: string; compute?: { sql: string; params: string[] } };
  subtitle?: { static?: string; compute?: { sql: string; params: string[] } };
  kpiUnit?: string;
  kpiState?: string;
  subValues?: Record<string, string>[];
  timeframe?: string;
}

export interface DashboardConfig {
  statCards: StatCard[];
  recentTable?: { title: string; columns: { key: string; label: string; type?: FieldType }[] };
}

export interface ActionConfig {
  key: string;
  label: string;
  icon: string;
  type: 'builtin' | 'custom';
  builtinType?: 'edit' | 'delete' | 'duplicate' | 'download' | 'print' | 'navigate';
  location?: ('header' | 'row' | 'bulk' | 'overflow')[];
  variant?: 'filled' | 'light' | 'outline' | 'subtle' | 'default';
  color?: string;
  order: number;
  visible?: { field?: string; equals?: string; context?: ('view' | 'edit' | 'create' | 'list')[]; permission?: string };
  confirm?: { title: string; message: string; confirmLabel?: string; cancelLabel?: string; confirmColor?: string; requireInput?: string };
  templates?: { key: string; label: string; description?: string; icon?: string; format?: string; endpoint?: string }[];
  api?: { endpoint: string; method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'; headers?: Record<string, string>; body?: Record<string, unknown>; params?: Record<string, string>; successMessage?: string; errorMessage?: string; onSuccess?: 'reload' | 'navigate' | 'navigateList' | 'close' | 'none'; navigateTo?: string };
  href?: string;
  overflow: boolean;
}

export interface ModuleConfig {
  key: string;
  label: string;
  singularLabel: string;
  icon: string;
  color: string;
  basePath: string;
  appKey: string;
  fields: FieldDef[];
  lineItems?: LineItemDef;
  tabs?: TabDef[];
  formLayout?: FormLayoutDef;
  actions: ActionConfig[];
  dashboard?: DashboardConfig;
  list?: ListConfig;
}
