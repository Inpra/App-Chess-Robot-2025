import PurchasePoints from '@/components/points/PurchasePoints';
import { Stack } from 'expo-router';
import React from 'react';

export default function PurchasePointsScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PurchasePoints />
    </>
  );
}
