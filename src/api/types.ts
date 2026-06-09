/**
 * This file re-exports types from the auto-generated OpenAPI types.
 * Run `pnpm generate:types` to regenerate the underlying types.
 */

export type {
  SchemaToken as Token,
  SchemaUserPublic as UserPublic,
  SchemaUserCreate as UserCreate,
  SchemaUserRegister as UserRegister,
  SchemaUserUpdate as UserUpdate,
  SchemaUserUpdateMe as UserUpdateMe,
  SchemaUsersPublic as UsersPublic,
  SchemaUpdatePassword as UpdatePassword,
  SchemaNewPassword as NewPassword,
  SchemaMessage as Message,
  SchemaHttpValidationError as HTTPValidationError,
  SchemaValidationError as ValidationError,
  SchemaNavigationConfig as NavigationConfig,
  SchemaNavigationGroup as NavigationGroup,
  SchemaNavigationItem as NavigationItem,
  SchemaUserMenuItem as UserMenuItem,
  SchemaAppConfig as AppConfig,
  SchemaAppNavItem as AppNavItem,
  SchemaRouteDef as RouteDef,
  SchemaLaunchpadConfigResolved as LaunchpadConfigResolved,
  SchemaLaunchpadAppResolved as LaunchpadAppResolved,
  SchemaLaunchpadTileResolved as LaunchpadTileResolved,
  SchemaQuickAccessPage as QuickAccessPage,
  SchemaSearchResponse as SearchResponse,
  SchemaSearchResult as SearchResult,
  SchemaCustomPageConfig as CustomPageConfig,
  SchemaActionConfig as ActionConfig,
  SchemaActionApi as ActionApi,
  SchemaActionConfirm as ActionConfirm,
  SchemaActionTemplate as ActionTemplate,
  SchemaActionVisibility as ActionVisibility,
  SchemaDataRequest as DataRequest,
  SchemaEnvelopeMeta as EnvelopeMeta,
  SchemaHomeItem as HomeItem,
  SchemaHtmlContentConfig as HtmlContentConfig,
  SchemaAppStatResolved as AppStatResolved,
  SchemaApiResponseNavigationConfig as ApiResponseNavigationConfig,
  SchemaApiResponseListUserMenuItem as ApiResponseUserMenuItem,
  SchemaApiResponseDictStrAppConfig as ApiResponseAppConfig,
  SchemaApiResponseListRouteDef as ApiResponseRouteDef,
  SchemaApiResponseDictStrCustomPageConfig as ApiResponseCustomPageConfig,
  SchemaApiResponseCustomPageConfig as ApiResponseCustomPageConfigSingle,
} from './generated-types';

export type { paths, operations } from './generated-types';

// Local types for legacy /items/ endpoint (not in current OpenAPI spec)
export interface Item {
  id: string;
  title: string;
  description?: string | null;
  owner_id: string;
}

export interface ItemCreate {
  title: string;
  description?: string | null;
}

export interface ItemPublic {
  id: string;
  title: string;
  description?: string | null;
  owner_id: string;
}

export interface ItemsPublic {
  data: ItemPublic[];
  count: number;
}