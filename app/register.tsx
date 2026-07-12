import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  Alert,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';

export default function RegisterScreen() {
  const { tr } = useLanguage();
  const { register } = useAuth();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [nickname, setNickname] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleRegister() {
    const user = username.trim();
    if (!user) {
      Alert.alert('', tr.registerUsernamePh);
      return;
    }
    if (!password) {
      Alert.alert('', tr.registerPasswordPh);
      return;
    }
    if (password !== passwordConfirmation) {
      Alert.alert('', tr.registerPasswordMismatch);
      return;
    }

    setSubmitting(true);
    try {
      await register({
        username: user,
        password,
        password_confirmation: passwordConfirmation,
        nickname: nickname.trim() || undefined,
        phone: phone.trim() || undefined,
      });
      router.replace('/(tabs)');
    } catch (e) {
      Alert.alert('', e instanceof Error ? e.message : tr.registerFailed);
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
        <ScrollView
          contentContainerStyle={s.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.logoSection}>
            <View style={s.logoRow}>
              <Text style={s.logoBet}>bet</Text>
              <Text style={s.logo365}>365</Text>
            </View>
            <Text style={s.logoSubtitle}>မောင်း</Text>
            <Text style={s.logoTagline}>{tr.registerSubtitle}</Text>
          </View>

          <View style={s.card}>
            <View style={s.fieldGroup}>
              <Text style={s.label}>{tr.registerUsernameLabel}</Text>
              <View style={s.inputWrapper}>
                <Ionicons name="person-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder={tr.registerUsernamePh}
                  placeholderTextColor={Colors.light.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>{tr.registerNicknameLabel}</Text>
              <View style={s.inputWrapper}>
                <Ionicons name="happy-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder={tr.registerNicknamePh}
                  placeholderTextColor={Colors.light.placeholder}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>{tr.registerPhoneLabel}</Text>
              <View style={s.inputWrapper}>
                <Ionicons name="call-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={phone}
                  onChangeText={setPhone}
                  placeholder={tr.registerPhonePh}
                  placeholderTextColor={Colors.light.placeholder}
                  keyboardType="phone-pad"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>{tr.registerPasswordLabel}</Text>
              <View style={s.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={tr.registerPasswordPh}
                  placeholderTextColor={Colors.light.placeholder}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(v => !v)}
                  style={s.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={Colors.light.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={s.fieldGroup}>
              <Text style={s.label}>{tr.registerConfirmLabel}</Text>
              <View style={s.inputWrapper}>
                <Ionicons name="lock-closed-outline" size={22} color={Colors.light.icon} style={s.inputIcon} />
                <TextInput
                  style={s.input}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                  placeholder={tr.registerConfirmPh}
                  placeholderTextColor={Colors.light.placeholder}
                  secureTextEntry={!showConfirm}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="done"
                  onSubmitEditing={handleRegister}
                />
                <TouchableOpacity
                  onPress={() => setShowConfirm(v => !v)}
                  style={s.eyeButton}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={Colors.light.icon}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[s.submitButton, submitting && s.submitButtonDisabled]}
              onPress={handleRegister}
              activeOpacity={0.85}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={s.submitButtonText}>{tr.registerButton}</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={s.switchRow}
              onPress={() => router.replace('/login')}
              activeOpacity={0.7}
            >
              <Text style={s.switchText}>{tr.registerHaveAccount} </Text>
              <Text style={s.switchLink}>{tr.registerGoLogin}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: Colors.brand.greenDark },
  flex: { flex: 1 },
  scroll: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
  },
  bgCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.brand.greenMid,
    opacity: 0.4,
    top: -80,
    right: -80,
  },
  bgCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: Colors.brand.greenLight,
    opacity: 0.2,
    bottom: 80,
    left: -60,
  },
  logoSection: { alignItems: 'center', paddingBottom: Spacing.lg },
  logoRow: { flexDirection: 'row', alignItems: 'baseline' },
  logoBet: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.white,
    letterSpacing: -1,
  },
  logo365: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.gold,
    letterSpacing: -1,
  },
  logoSubtitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.brand.gold,
    marginTop: 2,
    letterSpacing: 2,
  },
  logoTagline: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 4,
    letterSpacing: 1,
  },
  card: {
    backgroundColor: Colors.brand.white,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadow.lg,
  },
  fieldGroup: { marginBottom: Spacing.md },
  label: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.lg,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md,
    height: 54,
  },
  inputIcon: { marginRight: Spacing.sm },
  input: { flex: 1, fontSize: FontSize.lg, color: Colors.light.text },
  eyeButton: { padding: Spacing.xs },
  submitButton: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.xl,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  submitButtonDisabled: { opacity: 0.7 },
  submitButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.brand.white,
    letterSpacing: 0.5,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingVertical: 4,
  },
  switchText: { fontSize: FontSize.sm, color: Colors.light.textSecondary },
  switchLink: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenButton,
  },
});
