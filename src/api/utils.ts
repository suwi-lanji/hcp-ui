import { notifications } from '@mantine/notifications';

export function getErrorMessage(err: unknown): string {
  return (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'An error occurred';
}

export function showErrorNotification(title: string, err: unknown): void {
  notifications.show({
    title,
    message: getErrorMessage(err),
    color: 'red',
  });
}

export function showSuccessNotification(title: string, message: string): void {
  notifications.show({
    title,
    message,
    color: 'green',
  });
}