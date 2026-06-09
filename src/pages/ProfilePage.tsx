import { useState } from 'react';
import { useForm } from '@mantine/form';
import { TextInput, PasswordInput, Button, Paper, Title, Stack } from '@mantine/core';
import { useAuth } from '../auth/AuthContext';
import { usersApi } from '../api/endpoints';
import { showErrorNotification, showSuccessNotification } from '../api/utils';

export function ProfilePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const profileForm = useForm({
    initialValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
    },
  });

  const passwordForm = useForm({
    initialValues: {
      current_password: '',
      new_password: '',
    },
    validate: {
      new_password: (value) => (value.length < 8 ? 'Password must be at least 8 characters' : null),
    },
  });

  const handleProfileUpdate = async (values: typeof profileForm.values) => {
    setLoading(true);
    try {
      await usersApi.updateMe({ full_name: values.full_name || undefined, email: values.email || undefined });
      showSuccessNotification('Success', 'Profile updated');
    } catch (err: unknown) {
      showErrorNotification('Error', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values: typeof passwordForm.values) => {
    setPasswordLoading(true);
    try {
      await usersApi.updatePassword({ current_password: values.current_password, new_password: values.new_password });
      showSuccessNotification('Success', 'Password changed');
      passwordForm.reset();
    } catch (err: unknown) {
      showErrorNotification('Error', err);
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Stack gap="md">
      <Title order={2}>Profile</Title>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">Update Profile</Title>
        <form onSubmit={profileForm.onSubmit(handleProfileUpdate)}>
          <Stack>
            <TextInput label="Full name" {...profileForm.getInputProps('full_name')} />
            <TextInput label="Email" {...profileForm.getInputProps('email')} />
            <Button type="submit" loading={loading}>Save Changes</Button>
          </Stack>
        </form>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="md">Change Password</Title>
        <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
          <Stack>
            <PasswordInput label="Current password" required {...passwordForm.getInputProps('current_password')} />
            <PasswordInput label="New password" required {...passwordForm.getInputProps('new_password')} />
            <Button type="submit" loading={passwordLoading}>Change Password</Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  );
}