import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { pilgrimNavigationTheme } from './src/theme/navigationTheme';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SchoolListScreen from './src/screens/SchoolListScreen';
import SchoolDetailScreen from './src/screens/SchoolDetailScreen';
import ClosestSchoolsScreen from './src/screens/ClosestSchoolsScreen';
import SprayReportScreen from './src/screens/SprayReportScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';
import BrandLogo from './src/components/BrandLogo';

import { isAuthenticated } from './src/lib/auth';
import { initApi } from './src/lib/api';
import { startAutoSync } from './src/lib/offlineQueue';
import { pilgrimTheme } from './src/theme/pilgrimTheme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 20,
      retry: 1,
    },
  },
});

function tabIcon(label) {
  return ({ focused }) => (
    <View
      style={{
        width: 30,
        height: 30,
        borderRadius: 15,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? pilgrimTheme.colors.primaryDeep : 'transparent',
      }}
    >
      <Text
        style={{
          color: focused ? '#fff' : pilgrimTheme.colors.textMuted,
          fontWeight: '900',
          fontSize: 12,
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: pilgrimTheme.colors.surface },
        headerTintColor: pilgrimTheme.colors.primaryDeep,
        headerTitleStyle: {
          fontWeight: '800',
          color: pilgrimTheme.colors.ink,
        },
        tabBarActiveTintColor: pilgrimTheme.colors.primaryDeep,
        tabBarInactiveTintColor: pilgrimTheme.colors.textMuted,
        tabBarStyle: {
          backgroundColor: pilgrimTheme.colors.surface,
          borderTopColor: pilgrimTheme.colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '800',
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{ title: 'Command', tabBarIcon: tabIcon('H') }}
      />
      <Tab.Screen
        name="Nearby"
        component={ClosestSchoolsScreen}
        options={{ title: 'Nearby', tabBarIcon: tabIcon('N') }}
      />
      <Tab.Screen
        name="Schools"
        component={SchoolListScreen}
        options={{ title: 'Schools', tabBarIcon: tabIcon('S') }}
      />
      <Tab.Screen
        name="Reports"
        component={MyReportsScreen}
        options={{ title: 'Reports', tabBarIcon: tabIcon('R') }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const bootstrap = async () => {
      // Check for existing auth token
      const authed = await isAuthenticated();
      if (authed) setInitialRoute('Home');

      // Probe backend, enable mock mode if unreachable
      await initApi();

      setReady(true);
    };
    bootstrap();

    // Auto-sync offline queue when connectivity returns
    const unsubscribe = startAutoSync((result) => {
      if (result.synced > 0) {
        console.log(`[AutoSync] Synced ${result.synced} report(s)`);
      }
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: pilgrimTheme.colors.background,
          paddingHorizontal: 24,
        }}
      >
        <View
          style={{
            width: '100%',
            maxWidth: 320,
            borderRadius: 18,
            backgroundColor: '#fff',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 18,
            paddingHorizontal: 18,
            paddingVertical: 16,
            shadowColor: '#2d2d2d',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 4,
          }}
        >
          <BrandLogo width={250} />
        </View>
        <ActivityIndicator size="large" color={pilgrimTheme.colors.primary} />
        <Text
          style={{
            marginTop: 14,
            color: pilgrimTheme.colors.ink,
            fontSize: 18,
            fontWeight: '700',
          }}
        >
          Preparing field workflow
        </Text>
        <Text
          style={{
            marginTop: 8,
            color: pilgrimTheme.colors.textMuted,
            textAlign: 'center',
            lineHeight: 20,
          }}
        >
          Loading schools, sync state, and the tools your team needs to capture
          spray reports well.
        </Text>
      </View>
    );
  }

  return (
    <>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <QueryClientProvider client={queryClient}>
          <StatusBar style="dark" />
          <NavigationContainer theme={pilgrimNavigationTheme}>
            <Stack.Navigator
              initialRouteName={initialRoute}
              screenOptions={{
                headerStyle: { backgroundColor: pilgrimTheme.colors.surface },
                headerTintColor: pilgrimTheme.colors.primaryDeep,
                headerTitleStyle: {
                  fontWeight: '700',
                  color: pilgrimTheme.colors.ink,
                },
                headerShadowVisible: false,
                headerBackTitleVisible: false,
                contentStyle: { backgroundColor: pilgrimTheme.colors.background },
              }}
            >
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Home"
                component={MainTabs}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="SchoolDetail"
                component={SchoolDetailScreen}
                options={{ title: 'School Detail' }}
              />
              <Stack.Screen
                name="SprayReport"
                component={SprayReportScreen}
                options={{ title: 'New Report' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </QueryClientProvider>
      </GestureHandlerRootView>
    </>
  );
}
