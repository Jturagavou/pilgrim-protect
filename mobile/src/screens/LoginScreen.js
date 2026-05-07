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
import { syncQueue } from '../lib/offlineQueue';
import BrandLogo from '../components/BrandLogo';
import { pilgrimTheme } from '../theme/pilgrimTheme';

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
      syncQueue().catch((syncErr) => {
        console.log('[Login] Queued report sync skipped:', syncErr?.message);
      });
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
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
      <View style={styles.glowTop} />
      <View style={styles.inner}>
        <View style={styles.brand}>
          <View style={styles.logoPlate}>
            <BrandLogo width={270} />
          </View>
          <Text style={styles.title}>Pilgrim Protect</Text>
          <Text style={styles.subtitle}>Field Worker App</Text>
          <Text style={styles.brandCopy}>
            Capture school visits, room counts, and photo evidence with a mobile
            workflow that still works when signal drops.
          </Text>
        </View>

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
            selectionColor={pilgrimTheme.colors.primaryDeep}
            cursorColor={pilgrimTheme.colors.primaryDeep}
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
            selectionColor={pilgrimTheme.colors.primaryDeep}
            cursorColor={pilgrimTheme.colors.primaryDeep}
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
    backgroundColor: pilgrimTheme.colors.background,
  },
  glowTop: {
    position: 'absolute',
    top: -70,
    right: -40,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(255,109,35,0.12)',
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
  logoPlate: {
    width: '100%',
    maxWidth: 330,
    borderRadius: 18,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 16,
    marginBottom: 16,
    shadowColor: '#2d2d2d',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 18,
    elevation: 4,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: pilgrimTheme.colors.primaryDeep,
  },
  subtitle: {
    fontSize: 15,
    color: pilgrimTheme.colors.textMuted,
    marginTop: 4,
  },
  brandCopy: {
    marginTop: 12,
    maxWidth: 320,
    textAlign: 'center',
    color: pilgrimTheme.colors.textMuted,
    fontSize: 14,
    lineHeight: 22,
  },
  form: {
    backgroundColor: pilgrimTheme.colors.surface,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    ...pilgrimTheme.shadow.card,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: pilgrimTheme.colors.ink,
    marginBottom: 6,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: pilgrimTheme.colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: pilgrimTheme.colors.ink,
    backgroundColor: pilgrimTheme.colors.backgroundSoft,
  },
  button: {
    backgroundColor: pilgrimTheme.colors.primaryDeep,
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
    backgroundColor: pilgrimTheme.colors.dangerSurface,
    borderRadius: 8,
    padding: 10,
  },
  errorText: {
    color: pilgrimTheme.colors.dangerText,
    fontSize: 13,
    textAlign: 'center',
  },
  hint: {
    textAlign: 'center',
    color: pilgrimTheme.colors.textMuted,
    fontSize: 12,
    marginTop: 24,
    lineHeight: 18,
  },
});
