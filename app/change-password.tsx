import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, FontSize, FontWeight, Spacing, BorderRadius, Shadow } from '@/constants/theme';

export default function ChangePasswordScreen() {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNext, setShowNext]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleSubmit() {
    if (!current || !next || !confirm) {
      Alert.alert('အချက်အလက် မပြည့်စုံ', 'ကျေးဇူးပြု၍ အကွက်အားလုံး ဖြည့်ပါ။');
      return;
    }
    if (next !== confirm) {
      Alert.alert('စကားဝှက် မတူညီ', 'စကားဝှက်အသစ် နှင့် အတည်ပြုစကားဝှက် တူညီရမည်။');
      return;
    }
    if (next.length < 6) {
      Alert.alert('စကားဝှက် တိုလွန်း', 'စကားဝှက်အသစ် အနည်းဆုံး ၆ လုံး ထည့်ပါ။');
      return;
    }
    // TODO: call API
    Alert.alert('အောင်မြင်သည်', 'စကားဝှက် ပြောင်းလဲပြီးပါပြီ။', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={s.root} edges={['top']}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => router.back()} style={s.backBtn} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Change Password</Text>
          <Text style={s.headerSub}>စကားဝှက်ပြောင်းရန်</Text>
        </View>
        <Ionicons name="lock-closed-outline" size={22} color="rgba(255,255,255,0.4)" />
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <View style={s.body}>
          <View style={s.card}>
            {/* Current password */}
            <Field
              label="Password"
              sublabel="လက်ရှိ စကားဝှက်"
              value={current}
              onChange={setCurrent}
              secure={!showCurrent}
              onToggle={() => setShowCurrent(v => !v)}
              shown={showCurrent}
              returnKeyType="next"
            />
            <View style={s.sep} />

            {/* New password */}
            <Field
              label="New Password"
              sublabel="စကားဝှက်အသစ်"
              value={next}
              onChange={setNext}
              secure={!showNext}
              onToggle={() => setShowNext(v => !v)}
              shown={showNext}
              returnKeyType="next"
            />
            <View style={s.sep} />

            {/* Confirm password */}
            <Field
              label="Password Confirm"
              sublabel="စကားဝှက် အတည်ပြုပါ"
              value={confirm}
              onChange={setConfirm}
              secure={!showConfirm}
              onToggle={() => setShowConfirm(v => !v)}
              shown={showConfirm}
              returnKeyType="done"
              onSubmit={handleSubmit}
            />
          </View>

          {/* Submit */}
          <TouchableOpacity style={s.btn} onPress={handleSubmit} activeOpacity={0.85}>
            <Text style={s.btnText}>OK</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ─── Field component ──────────────────────────────────────────────────────────

type FieldProps = {
  label: string;
  sublabel: string;
  value: string;
  onChange: (v: string) => void;
  secure: boolean;
  shown: boolean;
  onToggle: () => void;
  returnKeyType: 'next' | 'done';
  onSubmit?: () => void;
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#F2F5F3' },

  header: {
    flexDirection: 'row', alignItems: 'center', gap: Spacing.sm,
    backgroundColor: Colors.brand.greenDark,
    paddingHorizontal: Spacing.md, paddingVertical: 12,
  },
  backBtn: { padding: 4, marginRight: 4 },
  headerTitle: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff' },
  headerSub: { fontSize: FontSize.xs, color: 'rgba(255,255,255,0.6)', marginTop: 1 },

  body: { flex: 1, padding: Spacing.md, justifyContent: 'flex-start', paddingTop: Spacing.lg },

  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    ...Shadow.md,
  },

  sep: { height: 1, backgroundColor: Colors.light.border, marginHorizontal: Spacing.md },

  field: { paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  fieldLabels: { marginBottom: 8 },
  fieldLabel: { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: Colors.light.text },
  fieldSub: { fontSize: FontSize.xs, color: Colors.light.textSecondary, marginTop: 1 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: Colors.light.background,
    borderRadius: BorderRadius.md,
    borderWidth: 1.5, borderColor: Colors.light.border,
    paddingHorizontal: Spacing.md, height: 50,
  },
  input: { flex: 1, fontSize: FontSize.md, color: Colors.light.text },
  eye: { padding: 4 },

  btn: {
    backgroundColor: Colors.brand.greenButton,
    borderRadius: BorderRadius.xl,
    height: 56,
    alignItems: 'center', justifyContent: 'center',
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  btnText: { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: '#fff', letterSpacing: 1 },
});
