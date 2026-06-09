import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, TextInput, Stack, Text, UnstyledButton, ScrollArea, Kbd, Divider, ThemeIcon, Loader, Center } from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';
import { configApi } from '../../api/endpoints';
import type { SearchResult } from '../../api/types';

interface SearchModalProps {
  opened: boolean;
  onClose: () => void;
}

export function SearchModal({ opened, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchResults = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setResults([]);
      return;
    }
    setIsLoading(true);
    try {
      const res = await configApi.search(searchQuery, 20);
      setResults(res.data || []);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchResults(query);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [query, fetchResults]);

  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const item of results) {
      const group = item.type || 'Result';
      if (!groups[group]) groups[group] = [];
      groups[group].push(item);
    }
    return groups;
  }, [results]);

  const handleItemClick = useCallback((href: string) => {
    onClose();
    setQuery('');
    if (href) navigate(href);
  }, [onClose, navigate]);

  return (
    <Modal opened={opened} onClose={() => { onClose(); setQuery(''); }} size="lg" withCloseButton={false} padding={0} radius="lg" overlayProps={{ blur: 3 }} centered>
      <div style={{ padding: '16px 16px 8px' }}>
        <TextInput
          placeholder="Search modules, pages, actions..."
          leftSection={<IconSearch size={18} stroke={1.5} />}
          value={query}
          onChange={(e) => setQuery(e.currentTarget.value)}
          size="lg"
          radius="md"
          autoFocus
          rightSection={isLoading ? <Loader size="xs" /> : <Kbd size="sm" style={{ marginRight: 4 }}>Esc</Kbd>}
          styles={{ input: { border: 'none', fontSize: 16 } }}
        />
      </div>
      <Divider />
      <ScrollArea h={400} offsetScrollbars>
        <div style={{ padding: '8px 8px 16px' }}>
          {query.length < 2 && (
            <Center py="xl">
              <Text c="dimmed" size="sm">Type at least 2 characters to search...</Text>
            </Center>
          )}
          {query.length >= 2 && results.length === 0 && !isLoading && (
            <Center py="xl">
              <Text c="dimmed" size="sm">No results found for "{query}"</Text>
            </Center>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group}>
              <Text size="xs" fw={600} c="dimmed" px="md" py={8} tt="uppercase" style={{ letterSpacing: 0.5 }}>{group}</Text>
              <Stack gap={2}>
                {items.map((item, idx) => (
                  <UnstyledButton
                    key={`${item.key}-${idx}`}
                    onClick={() => handleItemClick(item.path || '#')}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', borderRadius: 8, width: '100%', transition: 'background 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--mantine-color-gray-1)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <ThemeIcon size="sm" variant="light" color="blue" radius="md">
                      <IconSearch size={14} />
                    </ThemeIcon>
                    <div style={{ flex: 1 }}>
                      <Text size="sm" fw={500}>{item.label}</Text>
                      {item.description && <Text size="xs" c="dimmed">{item.description}</Text>}
                    </div>
                    <IconArrowRight size={14} color="var(--mantine-color-gray-5)" />
                  </UnstyledButton>
                ))}
              </Stack>
            </div>
          ))}
        </div>
      </ScrollArea>
    </Modal>
  );
}
