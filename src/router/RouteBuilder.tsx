import { lazy, Suspense, useMemo } from 'react';
import type { ComponentType } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Center, Loader } from '@mantine/core';
import { useConfig } from '../hooks/useConfigStore';
import type { RouteDef } from '../api/types';

const Launchpad = lazy(() => import('../components/launchpad/Launchpad').then((m) => ({ default: m.Launchpad })));
const Dashboard = lazy(() => import('../components/dashboard/Dashboard').then((m) => ({ default: m.Dashboard })));
const ModuleList = lazy(() => import('../components/list/ModuleList').then((m) => ({ default: m.ModuleList })));
const ModuleForm = lazy(() => import('../components/form/ModuleForm').then((m) => ({ default: m.ModuleForm })));
const ModuleView = lazy(() => import('../components/view/ModuleView').then((m) => ({ default: m.ModuleView })));
const SettingsPage = lazy(() => import('../components/settings/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const CustomPage = lazy(() => import('../components/custom/CustomPage').then((m) => ({ default: m.CustomPage })));

function LoadingFallback() {
  return (
    <Center py="xl">
      <Loader size="md" />
    </Center>
  );
}

function convertPattern(pattern: string): string {
  return pattern.replace(/\{([^}]+)\}/g, ':$1');
}

type RouteComponentProps = Record<string, unknown>;
type RouteComponent = ComponentType<RouteComponentProps>;

function getComponent(component: string): { Component: RouteComponent | null; props: RouteComponentProps } {
  switch (component) {
    case 'launchpad':
      return { Component: Launchpad as unknown as RouteComponent, props: {} };
    case 'dashboard':
      return { Component: Dashboard as unknown as RouteComponent, props: {} };
    case 'list':
      return { Component: ModuleList as unknown as RouteComponent, props: {} };
    case 'create':
      return { Component: ModuleForm as unknown as RouteComponent, props: { mode: 'create' } };
    case 'edit':
      return { Component: ModuleForm as unknown as RouteComponent, props: { mode: 'edit' } };
    case 'view':
      return { Component: ModuleView as unknown as RouteComponent, props: {} };
    case 'settings':
      return { Component: SettingsPage as unknown as RouteComponent, props: {} };
    case 'custom-page':
      return { Component: CustomPage as unknown as RouteComponent, props: {} };
    default:
      return { Component: null, props: {} };
  }
}

export function RouteBuilder() {
  const { routes } = useConfig();

  const routeElements = useMemo(() => {
    return routes
      .filter((route: RouteDef) => route.authRequired !== false)
      .map((route: RouteDef) => {
        const { Component, props } = getComponent(route.component);
        if (!Component) return null;

        return (
          <Route
            key={route.key}
            path={convertPattern(route.pattern)}
            element={<Component {...props} />}
          />
        );
      })
      .filter(Boolean);
  }, [routes]);

  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {routeElements}
        <Route path="*" element={<LoadingFallback />} />
      </Routes>
    </Suspense>
  );
}