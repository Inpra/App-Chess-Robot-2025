import { Redirect } from 'expo-router';

export default function Index() {
  // Redirect to dashboard (tabs) screen
  return <Redirect href="/(tabs)" />;
}
