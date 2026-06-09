import { useState } from 'react';
import { Drawer, Stack, Text, Group, ThemeIcon, Divider, Badge, ActionIcon, UnstyledButton, ScrollArea } from '@mantine/core';
import { IconBell, IconCheck, IconAlertTriangle, IconInfoCircle, IconX } from '@tabler/icons-react';

interface NotificationDrawerProps {
  opened: boolean;
  onClose: () => void;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  time: string;
  read: boolean;
}

const initialNotifications: Notification[] = [
  { id: '1', title: 'Low Stock Alert', message: 'Wireless Mouse stock is below reorder level (5 units remaining)', type: 'warning', time: '5 min ago', read: false },
  { id: '2', title: 'Order Delivered', message: 'Sales Order SO-0042 has been delivered to Acme Corp', type: 'success', time: '1 hour ago', read: false },
  { id: '3', title: 'Invoice Overdue', message: 'Invoice INV-0089 is overdue by 5 days for Globex Inc', type: 'error', time: '2 hours ago', read: false },
  { id: '4', title: 'Purchase Order Approved', message: 'PO-0018 has been approved by management', type: 'info', time: '3 hours ago', read: true },
  { id: '5', title: 'New Customer Registered', message: 'Stark Industries has been added as a new customer', type: 'info', time: '5 hours ago', read: true },
  { id: '6', title: 'Payment Received', message: 'Payment of $3,450 received from Initech', type: 'success', time: 'Yesterday', read: true },
  { id: '7', title: 'Stock Transfer Complete', message: 'Transfer of 50 units from Main Warehouse to North Branch completed', type: 'info', time: 'Yesterday', read: true },
];

const typeConfig = {
  info: { color: 'blue', icon: IconInfoCircle },
  warning: { color: 'orange', icon: IconAlertTriangle },
  success: { color: 'green', icon: IconCheck },
  error: { color: 'red', icon: IconAlertTriangle },
};

export function NotificationDrawer({ opened, onClose }: NotificationDrawerProps) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <Drawer opened={opened} onClose={onClose} title={<Group gap="sm"><ThemeIcon variant="light" color="sapBlue" radius="md"><IconBell size={18} /></ThemeIcon><Text fw={600}>Notifications</Text>{unreadCount > 0 && <Badge color="red" size="sm" circle>{unreadCount}</Badge>}</Group>} position="right" size={380} radius="md" shadow="xl">
      <Stack gap="md">
        <Group justify="space-between">
          <Text size="sm" c="dimmed">{unreadCount} unread</Text>
          <UnstyledButton onClick={markAllRead} style={{ fontSize: 12, color: 'var(--mantine-color-blue-6)' }}>Mark all as read</UnstyledButton>
        </Group>
        <Divider />
        <ScrollArea h={500} offsetScrollbars>
          <Stack gap="xs">
            {notifications.map((notif) => {
              const config = typeConfig[notif.type];
              const TypeIcon = config.icon;
              return (
                <div key={notif.id} style={{ padding: '12px', borderRadius: 8, background: notif.read ? 'transparent' : 'var(--sap-informative-background)', border: notif.read ? '1px solid var(--sap-element-border-color)' : '1px solid var(--sap-informative-color)', position: 'relative' }}>
                  <Group gap="sm" align="flex-start" wrap="nowrap">
                    <ThemeIcon size="sm" variant="light" color={config.color} radius="md" mt={2}><TypeIcon size={14} /></ThemeIcon>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Group gap="xs" justify="space-between">
                        <Text size="sm" fw={notif.read ? 400 : 600} truncate>{notif.title}</Text>
                        <ActionIcon variant="subtle" color="gray" size="xs" onClick={() => removeNotification(notif.id)} style={{ flexShrink: 0 }}><IconX size={12} /></ActionIcon>
                      </Group>
                      <Text size="xs" c="dimmed" lineClamp={2}>{notif.message}</Text>
                      <Text size="xs" c="dimmed" mt={4} opacity={0.7}>{notif.time}</Text>
                    </div>
                  </Group>
                </div>
              );
            })}
          </Stack>
        </ScrollArea>
      </Stack>
    </Drawer>
  );
}
