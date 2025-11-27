import PointsHistory from '@/components/points/PointsHistory';
import { Stack } from 'expo-router';
import React from 'react';

export default function PointsHistoryScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PointsHistory />
    </>
  );
}
