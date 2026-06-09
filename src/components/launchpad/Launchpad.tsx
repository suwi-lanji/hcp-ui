import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { SimpleGrid, Text, UnstyledButton, Box, Center, Loader } from '@mantine/core';
import { IconHome, IconPackage, IconShoppingCart, IconCurrencyDollar, IconUsers, IconFileText, IconChartBar, IconSettings, IconBox } from '@tabler/icons-react';
import { useLaunchpad } from '../../hooks/useConfigStore';
import AnalyticalTile from '../shared/AnalyticalTile';

const fioriTileColors = ['#0854a0', '#a93774', '#e9730c', '#6a4e9e', '#00857c', '#c0392b', '#2b7d2b', '#9b2b8e', '#1a8a8a', '#5a7a9a'];

const iconMap: Record<string, React.ComponentType<{ size?: number; color?: string }>> = {
  home: IconHome,
  package: IconPackage,
  shoppingCart: IconShoppingCart,
  currencyDollar: IconCurrencyDollar,
  users: IconUsers,
  fileText: IconFileText,
  chartBar: IconChartBar,
  settings: IconSettings,
  box: IconBox,
};

function FioriPageTile({ card, colorIndex }: { card: { title: string; description: string; icon: string; href: string; color: string }; colorIndex: number }) {
  const navigate = useNavigate();
  const Icon = iconMap[card.icon] || IconHome;
  const bgColor = fioriTileColors[colorIndex % fioriTileColors.length];

  return (
    <UnstyledButton onClick={() => navigate(card.href)} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="fiori-colored-tile" style={{ background: bgColor }}>
        <div style={{ position: 'absolute', top: 14, left: 16, width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={24} color="rgba(255,255,255,0.9)" />
        </div>
        <Text size="sm" fw={500} c="white" style={{ lineHeight: 1.3 }}>{card.title}</Text>
        <Text size="xs" c="white" style={{ opacity: 0.75, lineHeight: 1.3 }} mt={2}>{card.description}</Text>
      </div>
    </UnstyledButton>
  );
}

function FioriAppTile({ card }: { card: { title: string; description: string; icon: string; href: string; color: string } }) {
  const navigate = useNavigate();
  const Icon = iconMap[card.icon] || IconHome;
  const colorIndex = card.color === 'orange' ? 2 : card.color === 'blue' ? 0 : card.color === 'green' ? 6 : 3;
  const bgColor = fioriTileColors[colorIndex % fioriTileColors.length];

  return (
    <UnstyledButton onClick={() => navigate(card.href)} style={{ textDecoration: 'none', display: 'block' }}>
      <div className="fiori-light-tile">
        <div style={{ width: 40, height: 40, background: bgColor, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color="white" />
        </div>
        <Text size="xs" fw={500} c="var(--sap-text-color)" ta="center" style={{ lineHeight: 1.3, maxWidth: 120 }}>{card.title}</Text>
      </div>
    </UnstyledButton>
  );
}

function trendToState(trend?: string | null): 'Positive' | 'Negative' | 'None' {
  if (trend === 'up') return 'Positive';
  if (trend === 'down') return 'Negative';
  return 'None';
}

function getTileNavHref(card: { title?: string; href?: string }): string | undefined {
  const title = (card.title || '').toLowerCase();
  if (title.includes('revenue') || title.includes('invoice')) return '/app/sales/list?entity=invoices';
  if (title.includes('order') || title.includes('pending')) return '/app/sales/list?entity=sales-orders';
  if (title.includes('stock') || title.includes('low')) return '/app/inventory/list?entity=items';
  if (title.includes('customer')) return '/app/sales/list?entity=customers';
  if (title.includes('bill')) return '/app/purchases/list?entity=bills';
  return card.href;
}

export function Launchpad() {
  const navigate = useNavigate();
  const launchpad = useLaunchpad();

  const handleTileClick = useCallback((href: string) => {
    navigate(href);
  }, [navigate]);

  if (!launchpad) {
    return (
      <Center py="xl">
        <Loader size="md" />
      </Center>
    );
  }

  return (
    <div className="erp-content-inner" style={{ paddingTop: '1.5rem' }}>
      {launchpad.pages && launchpad.pages.length > 0 && (
        <Box mb="xl">
          <Text size="lg" fw={400} mb="sm" style={{ color: 'var(--sap-text-color)' }}>Pages</Text>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 4, xl: 6 }} spacing="sm">
            {launchpad.pages.map((card, idx) => (
              <FioriPageTile key={card.title} card={card} colorIndex={idx} />
            ))}
          </SimpleGrid>
        </Box>
      )}

      {launchpad.apps && launchpad.apps.length > 0 && (
        <Box mb="xl">
          <Text size="lg" fw={400} mb="sm" style={{ color: 'var(--sap-text-color)' }}>Apps</Text>
          <SimpleGrid cols={{ base: 3, sm: 4, lg: 5, xl: 6 }} spacing="sm">
            {launchpad.apps.map((card) => (
              <FioriAppTile key={card.title} card={card} />
            ))}
          </SimpleGrid>
        </Box>
      )}

      {launchpad.tiles && launchpad.tiles.length > 0 && (
        <Box mb="xl">
          <Text size="lg" fw={400} mb="sm" style={{ color: 'var(--sap-text-color)' }}>Insights ({launchpad.tiles.length})</Text>
          <SimpleGrid cols={{ base: 2, sm: 3, lg: 6 }} spacing="sm">
            {launchpad.tiles.map((card) => {
              const navHref = getTileNavHref(card);
              const trend = card.trend ?? undefined;
              return (
                <AnalyticalTile
                  key={card.title}
                  title={card.title}
                  subtitle={card.subtitle ?? undefined}
                  kpiValue={card.value || ''}
                  kpiState={trendToState(trend)}
                  icon={card.icon}
                  subValues={card.trendValue ? [{ label: trend === 'up' ? 'Trending Up' : 'Trending Down', value: card.trendValue }] : undefined}
                  timeframe={trend === 'up' ? 'Trending upward' : trend === 'down' ? 'Trending downward' : undefined}
                  onClick={navHref ? () => handleTileClick(navHref) : undefined}
                />
              );
            })}
          </SimpleGrid>
        </Box>
      )}
    </div>
  );
}
