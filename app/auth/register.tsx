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
import { signUp } from '@/utils/authService';
import { router } from 'expo-router';

export default function RegisterScreen() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await signUp(email, password, name);
      Alert.alert('Success', 'Account created successfully.', [
        { text: 'OK', onPress: () => router.replace('/auth/login') },
      ]);
    } catch (error: any) {
      Alert.alert('Registration Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Create Account</Text>
        <Text style={styles.subtitle}>Join Concreto today</Text>

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Full Name</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} />
        </View>

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

        <View style={styles.inputContainer}>
          <Text style={styles.label}>Confirm Password</Text>
          <TextInput
            style={styles.input}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
          />
        </View>

        <PrimaryButton
          title={loading ? 'Creating Account...' : 'Register'}
          onPress={handleRegister}
          disabled={loading}
          style={styles.registerButton}
        />

        <TouchableOpacity
          style={styles.loginLink}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.loginText}>
            Already have an account?{' '}
            <Text style={styles.loginTextBold}>Login</Text>
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
  registerButton: {
    marginTop: 16,
    backgroundColor: COLORS.blue,
  },
  loginLink: {
    marginTop: 24,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: 'Inter-Regular',
    fontSize: 14,
    color: COLORS.darkGray,
  },
  loginTextBold: {
    fontFamily: 'Inter-SemiBold',
    color: COLORS.primaryYellow,
  },
});
