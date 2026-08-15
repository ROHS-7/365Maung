import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import { useAuth } from '@/contexts/auth';
import { useRequireAuth } from '@/hooks/use-require-auth';
import { changePasswordRequest } from '@/services/auth';

export default function ChangePasswordScreen() {
  useRequireAuth();
  const { tr } = useLanguage();
  const { token } = useAuth();
  const [current, setCurrent]         = useState('');
  const [next, setNext]               = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!current || !next || !confirm) {
      Alert.alert(tr.changePwErrEmpty, tr.changePwErrEmptyMsg);
      return;
    }
    if (next !== confirm) {
      Alert.alert(tr.changePwErrMismatch, tr.changePwErrMismatchMsg);
      return;
    }
    if (next.length < 6) {
      Alert.alert(tr.changePwErrShort, tr.changePwErrShortMsg);
      return;
    }
    if (!token) {
      router.replace('/login');
      return;
    }

    setSubmitting(true);
    try {
      await changePasswordRequest(token, {
        current_password: current,
        password: next,
        password_confirmation: confirm,
      });
      Alert.alert(tr.changePwSuccess, tr.changePwSuccessMsg, [
        { text: tr.ok, onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert('', e instanceof Error ? e.message : tr.changePwFailed);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>{tr.changePwTitle}</Text>
          <Text style={s.headerSub}>{tr.changePwSub}</Text>
        </View>
        <Ionicons name="lock-closed-outline" size={22} color="rgba(255,255,255,0.4)" />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.body}>
          <View style={s.card}>
            <Field
              label={tr.changePwCurrent}
              sublabel={tr.changePwCurrentSub}
              value={current}
              onChange={setCurrent}
              secure={!showCurrent}
              shown={showCurrent}
              onToggle={() => setShowCurrent(v => !v)}
              returnKeyType="next"
            />
            <View style={s.sep} />
            <Field
              label={tr.changePwNew}
              sublabel={tr.changePwNewSub}
              value={next}
              onChange={setNext}
              secure={!showNext}
              shown={showNext}
              onToggle={() => setShowNext(v => !v)}
              returnKeyType="next"
            />
            <View style={s.sep} />
            <Field
              label={tr.changePwConfirm}
              sublabel={tr.changePwConfirmSub}
              value={confirm}
              onChange={setConfirm}
              secure={!showConfirm}
              shown={showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
              returnKeyType="done"
              onSubmit={handleSubmit}
            />
          </View>

          <TouchableOpacity
            style={[s.btn, submitting && s.btnDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.85}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.btnText}>{tr.changePwOK}</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string; sublabel: string;
  value: string; onChange: (v: string) => void;
  secure: boolean; shown: boolean; onToggle: () => void;
  returnKeyType: 'next' | 'done'; onSubmit?: () => void;
};

function Field({ label, sublabel, value, onChange, secure, shown, onToggle, returnKeyType, onSubmit }: FieldProps) {
  return (
    <View style={s.field}>
      <View style={s.fieldLabels}>
        <Text style={s.fieldLabel}>{label}</Text>
        <Text style={s.fieldSub}>{sublabel}</Text>
      </View>
      <View style={s.inputRow}>
        <TextInput
          style={s.input}
          value={value}
          onChangeText={onChange}
          secureTextEntry={secure}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmit}
          placeholder="••••••••"
          placeholderTextColor={Colors.light.placeholder}
        />
        <TouchableOpacity onPress={onToggle} style={s.eye} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name={shown ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.light.icon} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },
  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.brand.greenButton, paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },
  body: { flex: 1, padding: Spacing.md, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: BorderRadius.xl, ...Shadow.md },
  sep: { height: 1, backgroundColor: Colors.light.border, marginHorizontal: Spacing.md },
  field: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  fieldLabels: { marginBottom: 8 },
  fieldLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text },
  fieldSub: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.background, borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md, height: 50,
  },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.light.text },
  eye: { padding: 4 },
  btn: {
    backgroundColor: Colors.brand.greenButton, borderRadius: BorderRadius.xl,
    height: 56, alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.lg, ...Shadow.md,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 1 },
});
