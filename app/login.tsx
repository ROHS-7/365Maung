import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Switch, StyleSheet, KeyboardAvoidingView, Platform, StatusBar, ActivityIndicator, Alert,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';

export default function LoginScreen() {
  const { tr } = useLanguage();
  const { login } = useAuth();
  const [account, setAccount]         = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleLogin() {
    if (!account.trim() || !password.trim()) {
      Alert.alert('', tr.loginAccountPh);
      return;
    }
    setSubmitting(true);
    try {
      await login(account.trim(), password);
      router.replace('/');
    } catch (e) {
      Alert.alert('', e instanceof Error ? e.message : tr.loginFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <View style={s.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.brand.greenDark} />
      <View style={s.bgCircle1} />
      <View style={s.bgCircle2} />

      <KeyboardAvoidingView style={s.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.logoSection}>
          <Image
            source={require('@/assets/images/burma90.png')}
            style={s.logoImg}
            resizeMode="contain"
          />
          <Text style={s.logoTagline}>{tr.loginSubtitle}</Text>
        </View>

        <View style={s.card}>
          <View style={s.fieldGroup}>
            <Text style={s.label}>{tr.loginAccountLabel}</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="person-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
              <TextInput
                style={s.input}
                value={account}
                onChangeText={setAccount}
                placeholder={tr.loginAccountPh}
                placeholderTextColor={Colors.light.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          <View style={s.fieldGroup}>
            <Text style={s.label}>{tr.loginPasswordLabel}</Text>
            <View style={s.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                placeholder={tr.loginPasswordPh}
                placeholderTextColor={Colors.light.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(v => !v)}
                style={s.eyeButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={Colors.light.icon} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={s.rememberRow}>
            <Text style={s.rememberLabel}>{tr.loginRemember}</Text>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: Colors.light.border, true: Colors.brand.greenLight }}
              thumbColor={rememberMe ? Colors.brand.greenButton : Colors.brand.white}
              ios_backgroundColor={Colors.light.border}
            />
          </View>

          <TouchableOpacity
            style={[s.loginButton, submitting && s.loginButtonDisabled]}
            onPress={handleLogin}
            activeOpacity={0.85}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.loginButtonText}>{tr.loginButton}</Text>
            )}
          </TouchableOpacity>

          <Text style={s.helpText}>{tr.loginHelp}</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.brand.greenDark },
  flex: { flex: 1, justifyContent: 'center', paddingHorizontal: Spacing.md },
  bgCircle1: {
    position: 'absolute', width: 300, height: 300, borderRadius: 150,
    backgroundColor: Colors.brand.greenMid, opacity: 0.4, top: -80, right: -80,
  },
  bgCircle2: {
    position: 'absolute', width: 200, height: 200, borderRadius: 100,
    backgroundColor: Colors.brand.greenLight, opacity: 0.2, bottom: 80, left: -60,
  },
  logoSection: { alignItems: 'center', paddingBottom: Spacing.lg },
  logoImg: { width: 220, height: 120 },
  logoTagline: { fontSize: FontSize.sm, color: 'rgba(255,255,255,0.6)', marginTop: 8, letterSpacing: 1 },
  card: {
    backgroundColor: Colors.brand.white, borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg, paddingTop: Spacing.lg, paddingBottom: Spacing.md,
    ...Shadow.lg,
  },
  fieldGroup: { marginBottom: Spacing.md },
  label: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text, marginBottom: 6 },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.background, borderRadius: BorderRadius.lg,
    borderWidth: 1.5, borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md, height: 54,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.lg, color: Colors.light.text },
  eyeButton: { padding: Spacing.xs },
  rememberRow: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: Spacing.md, paddingVertical: 4,
  },
  rememberLabel: { fontSize: FontSize.md, color: Colors.light.text, fontWeight: FontWeight.medium },
  loginButton: {
    backgroundColor: Colors.brand.greenButton, borderRadius: BorderRadius.xl,
    height: 56, alignItems: 'center', justifyContent: 'center', ...Shadow.md,
  },
  loginButtonDisabled: { opacity: 0.7 },
  loginButtonText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: Colors.brand.white, letterSpacing: 0.5 },
  helpText: { fontSize: FontSize.sm, color: Colors.light.textSecondary, textAlign: 'center', marginTop: Spacing.sm },
});
