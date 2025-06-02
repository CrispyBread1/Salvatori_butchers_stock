import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/ui/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useAuth } from '@/hooks/useAuth';

export default function TabLayout() {
  const { user }  = useAuth();
  const colorScheme = useColorScheme();



  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: {
            // Use a transparent background on iOS to show the blur effect
            position: 'absolute',
          },
          default: {},
        }),
      }}>

      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      
      {/* Stock Screen - always included but with conditional href */}
      <Tabs.Screen
        name="stock"
        options={{
          title: 'Stock Take',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="playlist-add" color={color} />,
          href: (user && user.approved) ? undefined : null, // Only navigable if user is approved
        }} 
      />

      {/* Deliveries Screen - always included but with conditional href */}
      <Tabs.Screen
        name="deliveries"
        options={{
          title: 'Deliveries',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="add-box" color={color} />,
          href: (user && user.approved) ? undefined : null, // Only navigable if user is approved
        }} 
      />
      <Tabs.Screen
        name="conversions"
        options={{
          title: 'Conversions',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="add-box" color={color} />,
          href: (user && user.approved) ? undefined : null, // Only navigable if user is approved
        }} 
      />
    </Tabs>
  );
}
