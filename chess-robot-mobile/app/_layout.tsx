import { Stack } from 'expo-router';
import { LanguageProvider } from '@/context/LanguageContext';

export default function RootLayout() {
    return (
        <LanguageProvider>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(auth)" />
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="index" />
                <Stack.Screen name="profile" />
                <Stack.Screen name="game" />
                <Stack.Screen name="puzzles" />
                <Stack.Screen name="tutorial" />
                <Stack.Screen name="match-history" />
                <Stack.Screen name="points-history" />
                <Stack.Screen name="ranking" />
                <Stack.Screen name="faq" />
                <Stack.Screen name="purchase-points" />
            </Stack>
        </LanguageProvider>
    );
}
