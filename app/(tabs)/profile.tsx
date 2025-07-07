import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { COLORS } from '@/constants/Colors';
import PrimaryButton from '@/components/PrimaryButton';
import { useAuth } from '@/contexts/AuthContext';
import { signOut } from '@/utils/authService';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { user } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      router.replace('/auth/login');
    } catch (error: any) {
      Alert.alert('Error', 'Failed to log out');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.profileCard}>
        <Text style={styles.title}>User Profile</Text>

        <View style={styles.profileInfo}>
          <Text style={styles.label}>Email:</Text>
          <Text style={styles.value}>{user?.email}</Text>
        </View>

        <View style={styles.profileInfo}>
          <Text style={styles.label}>User ID:</Text>
          <Text style={styles.value}>{user?.uid.substring(0, 8)}...</Text>
        </View>

        <PrimaryButton
          title="Log Out"
          onPress={handleLogout}
          style={styles.logoutButton}
        />
      </View>

      <View style={styles.settingsCard}>
        <Text style={styles.title}>App Settings</Text>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>App Version</Text>
          <Text style={styles.settingValue}>1.0.0</Text>
        </View>

        <View style={styles.settingItem}>
          <Text style={styles.settingLabel}>Use Mock Data</Text>
          <Text style={styles.settingValue}>Enabled</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 16,
  },
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  settingsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontFamily: 'Inter-Bold',
    fontSize: 18,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
    width: 80,
  },
  value: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    flex: 1,
  },
  logoutButton: {
    backgroundColor: COLORS.error,
    marginTop: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  settingLabel: {
    fontFamily: 'Inter-Medium',
    fontSize: 16,
    color: COLORS.darkGray,
  },
  settingValue: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.blue,
  },
});
