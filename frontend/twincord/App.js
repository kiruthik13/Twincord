import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingScreen from './components/LoadingScreen';
import LoginScreen from './screens/LoginScreen';
import SignupScreen from './screens/SignupScreen';
import HomeScreen from './screens/HomeScreen';
import MeetingScreen from './screens/MeetingScreen';
import CommunitiesScreen from './screens/CommunitiesScreen';
import CommunityChatScreen from './screens/CommunityChatScreen';

const Stack = createStackNavigator();

// Navigation component that uses auth context
const AppNavigator = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Show loading screen while checking auth status
  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName={isAuthenticated ? "Home" : "Login"}
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: 'transparent' },
          cardStyleInterpolator: ({ current, layouts }) => {
            return {
              cardStyle: {
                transform: [
                  {
                    translateX: current.progress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [layouts.screen.width, 0],
                    }),
                  },
                ],
              },
            };
          },
        }}
      >
        {isAuthenticated ? (
          // Authenticated screens
          <>
          <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }}/>
          <Stack.Screen name="Meeting" component={MeetingScreen} options={{}}/>
          <Stack.Screen name="Communities" component={CommunitiesScreen} />
<Stack.Screen name="CommunityChat" component={CommunityChatScreen} options={{ title: 'Community Chat' }} />
          </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen 
              name="Login" 
              component={LoginScreen}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
            <Stack.Screen 
              name="Signup" 
              component={SignupScreen}
              options={{
                animationTypeForReplace: 'push',
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppNavigator />
    </AuthProvider>
  );
}