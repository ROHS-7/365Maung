import { useEffect, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from '@/constants/theme';
import { useLanguage } from '@/contexts/language';
import {
  subscribeAppAlert,
  type AppAlertButton,
  type AppAlertRequest,
} from '@/utils/app-alert';

export function AppAlertHost() {
  const { tr } = useLanguage();
  const [request, setRequest] = useState<AppAlertRequest | null>(null);

  useEffect(() => subscribeAppAlert(setRequest), []);

  if (Platform.OS !== 'web') return null;

  const buttons: AppAlertButton[] =
    request && request.buttons.length > 0
      ? request.buttons
      : [{ text: tr.ok }];

  function closeAndRun(btn?: AppAlertButton) {
    setRequest(null);
    const press = btn?.onPress;
    if (press) setTimeout(() => void press(), 0);
  }

  const cancelBtn = buttons.find((b) => b.style === 'cancel');

  return (
    <Modal
      visible={request != null}
      transparent
      animationType="fade"
      onRequestClose={() => closeAndRun(cancelBtn)}
    >
      <View style={s.wrap}>
        <Pressable
          style={s.backdrop}
          onPress={() => closeAndRun(cancelBtn)}
        />
        {request ? (
          <View style={s.card}>
            {request.title ? <Text style={s.title}>{request.title}</Text> : null}
            {request.message ? (
              <Text style={s.message}>{request.message}</Text>
            ) : null}
            <View style={[s.actions, buttons.length > 2 && s.actionsStack]}>
              {buttons.map((btn, i) => {
                const last = i === buttons.length - 1;
                const destructive = btn.style === 'destructive';
                const cancel = btn.style === 'cancel';
                const primary = last && !cancel;
                return (
                  <TouchableOpacity
                    key={`${btn.text}-${i}`}
                    style={[
                      s.btn,
                      cancel && s.btnCancel,
                      primary && s.btnPrimary,
                      destructive && s.btnDanger,
                    ]}
                    onPress={() => closeAndRun(btn)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        s.btnText,
                        cancel && s.btnTextCancel,
                        (primary || destructive) && s.btnTextPrimary,
                      ]}
                    >
                      {btn.text}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ) : null}
      </View>
    </Modal>
  );
}

const s = StyleSheet.create({
  wrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(13, 59, 36, 0.45)',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    lineHeight: 28,
  },
  message: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    lineHeight: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.md,
  },
  actionsStack: {
    flexDirection: 'column',
  },
  btn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: Colors.light.border,
    borderRadius: BorderRadius.md,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  btnCancel: {
    backgroundColor: '#fff',
  },
  btnPrimary: {
    flex: 1.2,
    backgroundColor: Colors.brand.greenButton,
    borderColor: Colors.brand.greenButton,
  },
  btnDanger: {
    backgroundColor: '#C0392B',
    borderColor: '#C0392B',
  },
  btnText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    lineHeight: 22,
  },
  btnTextCancel: {
    color: Colors.light.textSecondary,
  },
  btnTextPrimary: {
    color: '#fff',
  },
});
