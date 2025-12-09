import { Stack } from 'expo-router';
import { useAutoLogout } from '@/hooks/useAutoLogout';

export default function TabsLayout() {
  // Handle automatic logout when token expires
  useAutoLogout();

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" options={{ title: 'Dashboard' }} />
    </Stack>
  );
}
