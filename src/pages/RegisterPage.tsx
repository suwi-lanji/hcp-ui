import { useState } from 'react';
import { Stack, TextInput, PasswordInput, Button, Alert, Text } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { usersApi } from '../api/endpoints';
import { notifications } from '@mantine/notifications';
import { getErrorMessage } from '../api/utils';

export default function RegisterPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const full_name = formData.get('full_name') as string;

    try {
      await usersApi.register({
        email,
        password,
        full_name: full_name || undefined,
      });
      notifications.show({ title: 'Success', message: 'Account created successfully', color: 'green' });
      window.location.href = '/login';
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url(/login-bg.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 400,
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
        }}
      >
        <Stack gap="md">
          <div>
            <div style={{ textAlign: 'center', marginBottom: 8 }}>
              <img src="/logo.png" alt="Hera Cloud" style={{ height: 48, margin: '0 auto' }} />
            </div>
            <Text size="sm" c="dimmed" ta="center" mt={4}>
              Create your account
            </Text>
          </div>

          {error && (
            <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Full Name"
                name="full_name"
                type="text"
                placeholder="John Doe"
              />

              <TextInput
                label="Email"
                name="email"
                type="email"
                placeholder="you@example.com"
                required
              />

              <PasswordInput
                label="Password"
                name="password"
                placeholder="Min 8 characters"
                required
              />

              <Button type="submit" loading={loading} fullWidth mt="sm">
                Create Account
              </Button>
            </Stack>
          </form>
        </Stack>
      </div>
    </div>
  );
}