import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AppShell, Group, ActionIcon, Text, Popover, Avatar, Divider,
  ScrollArea, UnstyledButton, Indicator, Tooltip, NavLink,
} from '@mantine/core';
import {
  IconMenu2, IconSearch, IconBell, IconHelpCircle, IconHome,
} from '@tabler/icons-react';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import { useAuth } from '../../auth/AuthContext';
import { useConfig } from '../../hooks/useConfigStore';
import { SearchModal } from '../shared/SearchModal';
import { HelpDrawer } from '../shared/HelpDrawer';
import { NotificationDrawer } from '../shared/NotificationDrawer';

const iconMap: Record<string, React.ComponentType<{ size?: number; stroke?: number }>> = {
  home: IconHome,
};

function getIcon(iconName: string) {
  return iconMap[iconName] || IconHome;
}

export function TopBar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { navigation, userMenu } = useConfig();

  const [menuOpened, setMenuOpened] = useState(false);
  const [userMenuOpened, setUserMenuOpened] = useState(false);
  const [searchOpened, setSearchOpened] = useState(false);
  const [helpOpened, { open: openHelp, close: closeHelp }] = useDisclosure(false);
  const [notifOpened, { open: openNotif, close: closeNotif }] = useDisclosure(false);

  const isLargeScreen = useMediaQuery('(min-width: 768px)');
  const [activeGroup, setActiveGroup] = useState<string | null>(
    navigation?.groups?.[0]?.group_label || null
  );

  const userName = user?.full_name || user?.email || 'User';
  const userEmail = user?.email || '';
  const userInitials = userName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const homeItem = navigation?.home;

  const handleUserMenuClick = (item: typeof userMenu[number]) => {
    setUserMenuOpened(false);
    if (item.action === 'logout') {
      logout();
      navigate('/login');
    } else if (item.href) {
      navigate(item.href);
    }
  };

  const handleNavItemClick = (href: string) => {
    setMenuOpened(false);
    navigate(href);
  };

  return (
    <>
      <AppShell.Header h={48} style={{ display: 'flex', alignItems: 'center', padding: '0 12px', background: 'linear-gradient(135deg, #0854a0 0%, #0a6ed1 100%)', borderBottom: 'none', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', zIndex: 200 }}>
        <Group justify="space-between" style={{ flex: 1, height: 48 }}>
          <Group gap="sm">
            <Popover opened={menuOpened} onChange={setMenuOpened} position="bottom-start" width={isLargeScreen ? 650 : 280} shadow="md" withArrow arrowSize={8} offset={6} closeOnClickOutside>
              <Popover.Target>
                <ActionIcon variant="subtle" color="white" size="lg" onClick={() => setMenuOpened((o) => !o)} aria-label="Navigation menu" styles={{ root: { color: 'var(--sap-shell-icon-color)' } }}>
                  <IconMenu2 size={22} stroke={1.5} />
                </ActionIcon>
              </Popover.Target>

              <Popover.Dropdown p={0} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--sap-group-content-border-color)' }}>
                {isLargeScreen ? (
                  <div style={{ display: 'flex', height: 460 }}>
                    <ScrollArea w={240} type="hover" style={{ borderRight: '1px solid var(--sap-group-content-border-color)', backgroundColor: 'rgba(0,0,0,0.02)' }}>
                      {homeItem && (
                        <NavLink
                          label={homeItem.label}
                          leftSection={<IconHome size={18} />}
                          onClick={() => handleNavItemClick(homeItem.href)}
                          style={{ borderRadius: 0, padding: '12px 16px', fontWeight: 600 }}
                        />
                      )}
                      <Divider my={0} color="var(--sap-group-content-border-color)" />
                      {navigation?.groups?.map((group) => (
                        <NavLink
                          key={group.group_slug}
                          label={group.group_label}
                          active={activeGroup === group.group_label}
                          onClick={() => setActiveGroup(group.group_label)}
                          variant="subtle"
                          style={{ borderRadius: 0, padding: '10px 16px', fontWeight: 500 }}
                        />
                      ))}
                    </ScrollArea>

                    <ScrollArea style={{ flex: 1 }} type="hover">
                      <div style={{ padding: '12px 0' }}>
                        <Text size="xs" fw={700} c="dimmed" px="md" pb={8} tt="uppercase" style={{ letterSpacing: 0.5 }}>
                          {activeGroup}
                        </Text>
                        {navigation?.groups
                          ?.find((g) => g.group_label === activeGroup)
                          ?.items?.map((item) => {
                            const ItemIcon = getIcon(item.icon);
                            return (
                              <NavLink
                                key={`${item.entity}-${item.action}`}
                                label={item.label}
                                description={item.description || undefined}
                                leftSection={<ItemIcon size={16} />}
                                onClick={() => handleNavItemClick(`/app/${item.entity}/${item.action}`)}
                                style={{ borderRadius: 0, padding: '8px 16px' }}
                              />
                            );
                          })}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <ScrollArea h={460} type="hover">
                    {homeItem && (
                      <NavLink
                        label={homeItem.label}
                        description={homeItem.description || undefined}
                        leftSection={<IconHome size={18} />}
                        onClick={() => handleNavItemClick(homeItem.href)}
                        active
                        variant="light"
                        style={{ borderRadius: 0, padding: '8px 12px' }}
                      />
                    )}
                    <Divider my={0} color="var(--sap-group-content-border-color)" />
                    {navigation?.groups?.map((group) => (
                      <div key={group.group_slug}>
                        <Text size="xs" fw={600} c="dimmed" px="md" py={6} tt="uppercase" style={{ letterSpacing: 0.5 }}>{group.group_label}</Text>
                        {group.items?.map((item) => {
                          const ItemIcon = getIcon(item.icon);
                          return (
                            <NavLink
                              key={`${item.entity}-${item.action}`}
                              label={item.label}
                              description={item.description || undefined}
                              leftSection={<ItemIcon size={16} />}
                              onClick={() => handleNavItemClick(`/app/${item.entity}/${item.action}`)}
                              style={{ borderRadius: 0, padding: '6px 12px' }}
                            />
                          );
                        })}
                        <Divider my={0} color="var(--sap-group-content-border-color)" />
                      </div>
                    ))}
                  </ScrollArea>
                )}
              </Popover.Dropdown>
            </Popover>

            <Link to="/" style={{ textDecoration: 'none' }}>
              <Group gap={8} style={{ cursor: 'pointer' }}>
                <div style={{ width: 30, height: 22, borderRadius: 3, background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0.15) 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 10, letterSpacing: -0.3 }}>HERA</div>
                <Text fw={400} size="md" c="white" style={{ letterSpacing: -0.2 }}>HERA</Text>
              </Group>
            </Link>
          </Group>
          <Group gap={2}>
            <Tooltip label="Search (Ctrl+K)" position="bottom" color="dark">
              <ActionIcon variant="subtle" color="white" size="lg" onClick={() => setSearchOpened(true)} aria-label="Search" styles={{ root: { '&:hover': { background: 'rgba(255,255,255,0.15)' } } }}>
                <IconSearch size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Help" position="bottom" color="dark">
              <ActionIcon variant="subtle" color="white" size="lg" onClick={openHelp} aria-label="Help" styles={{ root: { '&:hover': { background: 'rgba(255,255,255,0.15)' } } }}>
                <IconHelpCircle size={18} stroke={1.5} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Notifications" position="bottom" color="dark">
              <Indicator color="red" size={8} processing offset={4} position="top-end" styles={{ indicator: { border: '1px solid #0854a0' } }}>
                <ActionIcon variant="subtle" color="white" size="lg" onClick={openNotif} aria-label="Notifications" styles={{ root: { '&:hover': { background: 'rgba(255,255,255,0.15)' } } }}>
                  <IconBell size={18} stroke={1.5} />
                </ActionIcon>
              </Indicator>
            </Tooltip>
            <div style={{ width: 1, height: 24, background: 'var(--sap-shell-border-color)', margin: '0 4px' }} />
            <Popover opened={userMenuOpened} onChange={setUserMenuOpened} position="bottom-end" width={220} shadow="md" withArrow arrowSize={8} offset={6} closeOnClickOutside>
              <Popover.Target>
                <UnstyledButton onClick={() => setUserMenuOpened((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '2px 8px', borderRadius: 20, cursor: 'pointer', transition: 'background 0.15s ease' }} onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.15)'; }} onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                  <Avatar src={null} alt="User" radius="xl" size={28} color="blue" styles={{ root: { border: '1.5px solid rgba(255,255,255,0.6)' } }}>{userInitials}</Avatar>
                  <div style={{ lineHeight: 1.2 }}><Text size="xs" fw={500} c="white">{userName}</Text></div>
                </UnstyledButton>
              </Popover.Target>
              <Popover.Dropdown p={0} style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--sap-group-content-border-color)' }}>
                <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--sap-group-content-border-color)', background: 'var(--sap-background-color)' }}>
                  <Text size="sm" fw={600}>{userName}</Text>
                  <Text size="xs" c="dimmed">{userEmail}</Text>
                </div>
                {userMenu.map((item) => {
                  const ItemIcon = getIcon(item.icon);
                  return (
                    <NavLink
                      key={item.label}
                      label={item.label}
                      leftSection={<ItemIcon size={16} />}
                      onClick={() => handleUserMenuClick(item)}
                      color={item.color || 'dark'}
                      style={{ borderRadius: 0, padding: '6px 12px' }}
                    />
                  );
                })}
              </Popover.Dropdown>
            </Popover>
          </Group>
        </Group>
      </AppShell.Header>
      <SearchModal opened={searchOpened} onClose={() => setSearchOpened(false)} />
      <HelpDrawer opened={helpOpened} onClose={closeHelp} />
      <NotificationDrawer opened={notifOpened} onClose={closeNotif} />
    </>
  );
}
