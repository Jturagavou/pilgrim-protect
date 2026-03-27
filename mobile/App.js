import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './src/screens/LoginScreen';
import SchoolListScreen from './src/screens/SchoolListScreen';
import SprayReportScreen from './src/screens/SprayReportScreen';
import MyReportsScreen from './src/screens/MyReportsScreen';

import { isAuthenticated } from './src/lib/auth';
import { initApi } from './src/lib/api';
import { startAutoSync } from './src/lib/offlineQueue';

const Stack = createNativeStackNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState('Login');

  useEffect(() => {
    const bootstrap = async () => {
      // Check for existing auth token
      const authed = await isAuthenticated();
      if (authed) setInitialRoute('SchoolList');

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
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F5F5F5' }}>
        <ActivityIndicator size="large" color="#1B5E20" />
        <Text style={{ marginTop: 12, color: '#666' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerStyle: { backgroundColor: '#FFFFFF' },
            headerTintColor: '#1B5E20',
            headerTitleStyle: { fontWeight: '600' },
            headerShadowVisible: false,
            headerBackTitleVisible: false,
          }}
        >
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="SchoolList"
            component={SchoolListScreen}
            options={{ title: 'Schools' }}
          />
          <Stack.Screen
            name="SprayReport"
            component={SprayReportScreen}
            options={{ title: 'New Report' }}
          />
          <Stack.Screen
            name="MyReports"
            component={MyReportsScreen}
            options={{ title: 'My Reports' }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
