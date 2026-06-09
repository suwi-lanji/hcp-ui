import { type ReactNode } from 'react';
import { Center, Loader } from '@mantine/core';
import { useAuth } from '../../auth/AuthContext';
import { useConfigStoreInit } from '../../hooks/useConfigStore';

interface AppInitializerProps {
  children: ReactNode;
}

export function AppInitializer({ children }: AppInitializerProps) {
  const { isLoading: authLoading, isInitialized: authInitialized } = useAuth();
  const { isLoading: configLoading, isInitialized: configInitialized } = useConfigStoreInit();

  const isReady = authInitialized && (!authLoading || configInitialized);

  if (!isReady || (authInitialized && configLoading && !configInitialized)) {
    return (
      <Center h="100vh">
        <Loader size="lg" />
      </Center>
    );
  }

  return <>{children}</>;
}
