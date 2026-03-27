import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
} from 'react-native';
import { login } from '../lib/api';
import { storeToken, storeUser } from '../lib/auth';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter email and password');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const data = await login(email.trim().toLowerCase(), password);
      await storeToken(data.token);
      await storeUser(data.user);
      navigation.reset({ index: 0, routes: [{ name: 'SchoolList' }] });
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        {/* Logo / Brand */}
        <View style={styles.brand}>
          <View style={styles.logoCircle}>
            <Text style={styles.logoText}>PP</Text>
          </View>
          <Text style={styles.title}>Pilgrim Protect</Text>
          <Text style={styles.subtitle}>Field Worker App</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="worker1@test.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            editable={!loading}
          />

          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            secureTextEntry
            editable={!loading}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>Login</Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Workers are registered by your admin.{'\n'}
          Contact your supervisor if you can't login.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  inner: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  brand: {
    alignItems: 'center',
    marginBottom: 36,
  },
  logoCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#1B5E20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '800',
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1B5E20',
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 4,
  },
  form: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1B1B1B',
    backgroundColor: '#FAFAFA',
  },
  button: {
    backgroundColor: '#1B5E20',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFF',
    fontSize: 17,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: '#C62828',
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
  },
});
