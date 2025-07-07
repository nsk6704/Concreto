import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { COLORS } from '@/constants/Colors';
import PrimaryButton from '@/components/PrimaryButton';
import { signIn } from '@/utils/authService';
import { router } from 'expo-router';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Welcome to Concreto</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <PrimaryButton
          title={loading ? 'Logging in...' : 'Login'}
          onPress={handleLogin}
          disabled={loading}
          style={styles.loginButton}
        />

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.registerText}>
            Don't have an account?{' '}
            <Text style={styles.registerTextBold}>Register</Text>
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 20,
  },
  formContainer: {
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
    fontSize: 24,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: COLORS.darkGray,
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontFamily: 'Inter-Medium',
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  input: {
    backgroundColor: COLORS.lightGray,
    borderRadius: 8,
    padding: 12,
    fontFamily: 'Inter-Regular',
    fontSize: 16,
  },
  loginButton: {
    marginTop: 16,
    backgroundColor: COLORS.primaryYellow,
  },
  registerLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  registerText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  registerTextBold: {
    fontFamily: 'Inter-SemiBold',
    color: COLORS.blue,
  },
});
