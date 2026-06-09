import { Group, Button, ActionIcon, Menu } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { IconArrowLeft, IconEdit, IconTrash, IconDots } from '@tabler/icons-react';
import * as Icons from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { apiClient } from '@/api/client';
import type { ActionConfig, ModuleConfig } from '@/types/moduleConfig';

interface ActionBarProps {
  module: ModuleConfig;
  itemId: string;
  itemData: Record<string, unknown>;
  accentColor: string;
  onRefresh: () => void;
}

type IconLike = React.ComponentType<{ size?: number }>;
const iconMap = Icons as unknown as Record<string, IconLike>;
function resolveIcon(name?: string): IconLike | null {
  if (!name) return null;
  return iconMap[`Icon${name.charAt(0).toUpperCase()}${name.slice(1)}`] ?? null;
}

export function ActionBar({ module, itemId, itemData, accentColor, onRefresh }: ActionBarProps) {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`${module.basePath}/${itemId}/edit?entity=${module.key}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Delete this ${module.singularLabel}?`)) return;

    try {
      await apiClient.post(`/data/${module.key}/delete`, {
        params: { id: itemId }
      });
      notifications.show({
        title: 'Success',
        message: `${module.singularLabel} deleted`,
        color: 'green',
      });
      navigate(`${module.basePath}/list?entity=${module.key}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  const handleCustomAction = async (action: ActionConfig & { builtinType?: string; templates?: { key: string; format?: string }[] }) => {
    if (action.confirm) {
      const confirmed = confirm(action.confirm.message || `Execute ${action.label}?`);
      if (!confirmed) return;
    }

    try {
      if (action.type === 'builtin' && (action.builtinType === 'print' || action.builtinType === 'download')) {
        await handlePrintDownload(action);
        return;
      }

      if (action.api?.endpoint) {
        const endpoint = action.api.endpoint.replace('{id}', itemId);
        await apiClient({
          method: action.api.method || 'POST',
          url: endpoint,
          data: action.api.body || {},
        });

        notifications.show({
          title: 'Success',
          message: action.api.successMessage || 'Action completed',
          color: 'green',
        });

        if (action.api.onSuccess === 'reload') {
          onRefresh();
        } else if (action.api.onSuccess === 'navigate' && action.api.navigateTo) {
          navigate(action.api.navigateTo.replace('{id}', itemId));
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Action failed';
      notifications.show({
        title: 'Error',
        message: action.api?.errorMessage || message,
        color: 'red',
      });
    }
  };

  const handlePrintDownload = async (action: { builtinType?: string; templates?: { key: string; format?: string }[] }) => {
    try {
      const template = action.templates?.[0] || { key: 'default', format: 'pdf' };

      const response = await apiClient.get(
        `/documents/${module.appKey}/${module.key}/${itemId}?template_key=${template.key}`
      );

      const { html, fileName } = response.data.data as { html: string; fileName: string };

      if (action.builtinType === 'print') {
        const printWindow = window.open('', '_blank');
        if (printWindow) {
          printWindow.document.write(html);
          printWindow.document.close();
          printWindow.print();
        }
      } else {
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        tempDiv.style.position = 'absolute';
        tempDiv.style.left = '-9999px';
        document.body.appendChild(tempDiv);

        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(tempDiv);
        const imgData = canvas.toDataURL('image/png');

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        doc.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        doc.save(fileName);

        document.body.removeChild(tempDiv);

        notifications.show({
          title: 'Success',
          message: 'Document downloaded',
          color: 'green',
        });
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate document';
      notifications.show({
        title: 'Error',
        message,
        color: 'red',
      });
    }
  };

  // Filter actions for header location
  const headerActions = module.actions?.filter((action) => {
    if (!action.location?.includes('header')) return false;
    if (action.visible?.field && action.visible?.equals) {
      return itemData[action.visible.field] === action.visible.equals;
    }
    return true;
  }) || [];

  // Filter overflow actions
  const overflowActions = module.actions?.filter((action) =>
    action.overflow || action.location?.includes('overflow')
  ) || [];

  const renderActionButton = (action: ActionConfig & { builtinType?: string }) => {
    const IconComponent = resolveIcon(action.icon);

    if (action.type === 'builtin') {
      if (action.builtinType === 'edit') {
        return (
          <Button
            key={action.key}
            size="sm"
            variant={action.variant || 'light'}
            color={action.color}
            onClick={handleEdit}
            leftSection={IconComponent ? <IconComponent size={16} /> : <IconEdit size={16} />}
          >
            {action.label}
          </Button>
        );
      }
      if (action.builtinType === 'delete') {
        return (
          <Button
            key={action.key}
            size="sm"
            variant={action.variant || 'subtle'}
            color={action.color || 'red'}
            onClick={handleDelete}
            leftSection={IconComponent ? <IconComponent size={16} /> : <IconTrash size={16} />}
          >
            {action.label}
          </Button>
        );
      }
      if (action.builtinType === 'print' || action.builtinType === 'download') {
        return (
          <Button
            key={action.key}
            size="sm"
            variant={action.variant || 'subtle'}
            color={action.color}
            onClick={() => handleCustomAction(action)}
            leftSection={IconComponent ? <IconComponent size={16} /> : null}
          >
            {action.label}
          </Button>
        );
      }
    }

    // Custom action
    return (
      <Button
        key={action.key}
        size="sm"
        variant={action.variant || 'filled'}
        color={action.color}
        onClick={() => handleCustomAction(action)}
        leftSection={IconComponent ? <IconComponent size={16} /> : null}
      >
        {action.label}
      </Button>
    );
  };

  return (
    <Group gap="xs">
      <Button
        variant="outline"
        size="sm"
        onClick={() => navigate(`${module.basePath}/list?entity=${module.key}`)}
        leftSection={<IconArrowLeft size={16} />}
        style={{ borderColor: accentColor, color: accentColor }}
      >
        Back
      </Button>

      {headerActions.map((action) => renderActionButton(action))}

      {overflowActions.length > 0 && (
        <Menu position="bottom-end">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="lg">
              <IconDots size={18} />
            </ActionIcon>
          </Menu.Target>
          <Menu.Dropdown>
            {overflowActions.map((action) => {
              const IconComponent = resolveIcon(action.icon);
              return (
                <Menu.Item
                  key={action.key}
                  leftSection={IconComponent ? <IconComponent size={16} /> : null}
                  color={action.color}
                  onClick={() => action.type === 'builtin' && action.builtinType === 'delete' ? handleDelete() : handleCustomAction(action as never)}
                >
                  {action.label}
                </Menu.Item>
              );
            })}
          </Menu.Dropdown>
        </Menu>
      )}
    </Group>
  );
}
