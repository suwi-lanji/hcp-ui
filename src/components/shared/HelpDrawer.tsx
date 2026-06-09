import { Drawer, Stack, Text, Accordion, Group, ThemeIcon, Divider, Badge } from '@mantine/core';
import { IconHelpCircle, IconBook, IconKeyboard, IconQuestionMark, IconMessageChatbot, IconExternalLink } from '@tabler/icons-react';

interface HelpDrawerProps {
  opened: boolean;
  onClose: () => void;
}

const helpSections = [
  {
    title: 'Getting Started',
    icon: IconBook,
    items: [
      { q: 'How do I create a new sales order?', a: 'Navigate to Sales > Sales Orders, then click the "New" button. Fill in the customer details, add line items, and save.' },
      { q: 'How do I add a new product?', a: 'Go to Inventory > Products and click "New". Fill in the product details including SKU, pricing, and warehouse location.' },
      { q: 'How do I manage stock levels?', a: 'Use the Stock Movements module to record stock in, stock out, and transfers between warehouses.' },
    ],
  },
  {
    title: 'Keyboard Shortcuts',
    icon: IconKeyboard,
    items: [
      { q: 'Global Search', a: 'Ctrl + K — Opens the search modal to quickly find any module or page.' },
      { q: 'Quick Create', a: 'Ctrl + N — Opens the quick create menu for new records.' },
      { q: 'Navigate Home', a: 'Ctrl + H — Returns to the ERP Launchpad home page.' },
    ],
  },
  {
    title: 'FAQ',
    icon: IconQuestionMark,
    items: [
      { q: 'Can I customize the launchpad tiles?', a: 'Yes, go to Settings > General > Launchpad to configure which tiles appear on your home page.' },
      { q: 'How do I export data?', a: 'On any list page, use the export button in the toolbar to download data as CSV or Excel.' },
      { q: 'Can I set up automatic reorder alerts?', a: 'Yes, configure reorder levels on products and enable notifications in Settings > Notifications.' },
    ],
  },
];

export function HelpDrawer({ opened, onClose }: HelpDrawerProps) {
  return (
    <Drawer opened={opened} onClose={onClose} title={<Group gap="sm"><ThemeIcon variant="light" color="sapBlue" radius="md"><IconHelpCircle size={18} /></ThemeIcon><Text fw={600}>Help Center</Text></Group>} position="right" size={380} radius="md" shadow="xl">
      <Stack gap="lg">
        <Group gap="sm">
          <Badge variant="light" color="blue" size="lg" leftSection={<IconMessageChatbot size={14} />} styles={{ root: { cursor: 'pointer' }, label: { fontSize: 11 } }}>Live Chat</Badge>
          <Badge variant="light" color="violet" size="lg" leftSection={<IconExternalLink size={14} />} styles={{ root: { cursor: 'pointer' }, label: { fontSize: 11 } }}>Documentation</Badge>
        </Group>
        <Divider />
        {helpSections.map((section) => (
          <div key={section.title}>
            <Group gap="sm" mb="sm">
              <ThemeIcon size="sm" variant="light" color="gray" radius="md"><section.icon size={14} /></ThemeIcon>
              <Text size="sm" fw={600}>{section.title}</Text>
            </Group>
            <Accordion variant="separated" radius="md" chevronPosition="right">
              {section.items.map((item, idx) => (
                <Accordion.Item key={idx} value={`help-${section.title}-${idx}`}>
                  <Accordion.Control style={{ fontSize: 13 }}>{item.q}</Accordion.Control>
                  <Accordion.Panel><Text size="sm" c="dimmed">{item.a}</Text></Accordion.Panel>
                </Accordion.Item>
              ))}
            </Accordion>
          </div>
        ))}
      </Stack>
    </Drawer>
  );
}
