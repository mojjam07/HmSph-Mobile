import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuth } from './src/context/AuthContext';
import { Home, Heart, User, Search, Info, Phone, Building, Users, Star } from 'lucide-react-native';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PropertyDetailsScreen from './src/screens/PropertyDetailsScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegistrationScreen from './src/screens/RegistrationScreen';
import RoleSelectionScreen from './src/screens/RoleSelectionScreen';

// Import new OtherPages screens
import AboutScreen from './src/screens/AboutScreen';
import ContactScreen from './src/screens/ContactScreen';
import PropertiesScreen from './src/screens/PropertiesScreen';
import AgentsScreen from './src/screens/AgentsScreen';
import ReviewsScreen from './src/screens/ReviewsScreen';

// Import dashboard screens
import AdminDashboardScreen from './src/screens/AdminDashboardScreen';
import AgentDashboardScreen from './src/screens/AgentDashboardScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function LoadingScreen() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#007bff" />
    </View>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator initialRouteName="RoleSelection">
      <Stack.Screen
        name="RoleSelection"
        component={RoleSelectionScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Login"
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Registration"
        component={RegistrationScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconComponent;

          if (route.name === 'Home') {
            iconComponent = <Home size={size} color={color} />;
          } else if (route.name === 'Favorites') {
            iconComponent = <Heart size={size} color={color} />;
          } else if (route.name === 'Profile') {
            iconComponent = <User size={size} color={color} />;
          }

          return iconComponent;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: '#666',
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesScreen}
        options={{ title: 'Favorites' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="PropertyDetails"
        component={PropertyDetailsScreen}
        options={{
          headerShown: false,
          presentation: 'modal'
        }}
      />
      {/* OtherPages Screens */}
      <Stack.Screen
        name="About"
        component={AboutScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Contact"
        component={ContactScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Properties"
        component={PropertiesScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Agents"
        component={AgentsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Reviews"
        component={ReviewsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AdminDashboard"
        component={AdminDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AgentDashboard"
        component={AgentDashboardScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      {isAuthenticated ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
