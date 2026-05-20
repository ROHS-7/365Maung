import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

export default function LoginScreen() {
  const [account, setAccount] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  function handleLogin() {
    router.replace('/(tabs)');
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.brand.greenDark} />

      <View style={styles.bgCircle1} />
      <View style={styles.bgCircle2} />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Logo Section */}
        <View style={styles.logoSection}>
          <View style={styles.logoRow}>
            <Text style={styles.logoBet}>bet</Text>
            <Text style={styles.logo365}>365</Text>
          </View>
          <Text style={styles.logoSubtitle}>မောင်း</Text>
          <Text style={styles.logoTagline}>Members Login</Text>
        </View>

        {/* Form Card */}
        <View style={styles.card}>
          {/* Account Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>အကောင့် (Account)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="person-outline"
                size={22}
                color={Colors.light.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={account}
                onChangeText={setAccount}
                placeholder="အကောင့်နာမည် ထည့်ပါ"
                placeholderTextColor={Colors.light.placeholder}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
              />
            </View>
          </View>

          {/* Password Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.label}>စကားဝှက် (Password)</Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="lock-closed-outline"
                size={22}
                color={Colors.light.icon}
                style={styles.inputIcon}
              />
              <TextInput
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                placeholder="စကားဝှက် ထည့်ပါ"
                placeholderTextColor={Colors.light.placeholder}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="done"
                onSubmitEditing={handleLogin}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                activeOpacity={0.7}
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

          {/* Remember Me */}
          <View style={styles.rememberRow}>
            <Text style={styles.rememberLabel}>မှတ်ထားပါ (Remember me)</Text>
            <Switch
              value={rememberMe}
              onValueChange={setRememberMe}
              trackColor={{ false: Colors.light.border, true: Colors.brand.greenLight }}
              thumbColor={rememberMe ? Colors.brand.greenButton : Colors.brand.white}
              ios_backgroundColor={Colors.light.border}
            />
          </View>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={handleLogin}
            activeOpacity={0.85}
          >
            <Text style={styles.loginButtonText}>ဝင်ရောက်မည် (Login)</Text>
          </TouchableOpacity>

          <Text style={styles.helpText}>အကူအညီ လိုအပ်ပါက ဆက်သွယ်ပါ</Text>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.brand.greenDark,
  },
  flex: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.md,
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

  // Logo
  logoSection: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
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

  // Card
  card: {
    backgroundColor: Colors.brand.white,
    borderRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    ...Shadow.lg,
  },

  // Fields
  fieldGroup: {
    marginBottom: Spacing.md,
  },
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
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.lg,
    color: Colors.light.text,
  },
  eyeButton: {
    padding: Spacing.xs,
  },

  // Remember Me
  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
    paddingVertical: 4,
  },
  rememberLabel: {
    fontSize: FontSize.md,
    color: Colors.light.text,
    fontWeight: FontWeight.medium,
  },

  // Login Button
  loginButton: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.xl,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadow.md,
  },
  loginButtonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.brand.white,
    letterSpacing: 0.5,
  },

  helpText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.md,
  },
});
