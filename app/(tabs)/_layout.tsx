import { Tabs } from 'expo-router';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import { Play, Sliders, Activity, History, User } from 'lucide-react-native';
import { COLORS } from '@/constants/Colors';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { router } from 'expo-router';

export default function TabLayout() {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login');
    }
  }, [user, loading]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primaryYellow} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: COLORS.primaryYellow,
        tabBarInactiveTintColor: '#333',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        tabBarIconStyle: styles.tabBarIcon,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mixer',
          tabBarIcon: ({ color, size }) => <Play size={size} color={color} />,
          headerTitle: 'Concrete Mixer',
        }}
      />
      <Tabs.Screen
        name="design-inputs"
        options={{
          title: 'Design',
          tabBarIcon: ({ color, size }) => (
            <Sliders size={size} color={color} />
          ),
          headerTitle: 'Mix Design Inputs',
        }}
      />
      <Tabs.Screen
        name="sensor-readings"
        options={{
          title: 'Sensors',
          tabBarIcon: ({ color, size }) => (
            <Activity size={size} color={color} />
          ),
          headerTitle: 'Live Sensor Readings',
        }}
      />
      <Tabs.Screen
        name="previous-mixes"
        options={{
          title: 'History',
          tabBarIcon: ({ color, size }) => (
            <History size={size} color={color} />
          ),
          headerTitle: 'Previous Mixes',
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
          headerTitle: 'User Profile',
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f5f5f5',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    height: 65,
    paddingBottom: 10,
    paddingTop: 5,
  },
  tabBarLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 12,
  },
  tabBarIcon: {
    marginBottom: -5,
  },
  header: {
    backgroundColor: '#f5f5f5',
    height: 100,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  headerTitle: {
    fontFamily: 'Inter-SemiBold',
    fontSize: 18,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
  },
});
