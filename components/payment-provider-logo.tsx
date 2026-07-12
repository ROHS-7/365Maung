import { Image, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getProviderMeta } from '@/constants/payment-providers';

type Props = {
  provider: string;
  size?: number;
};

export function PaymentProviderLogo({ provider, size = 48 }: Props) {
  const meta = getProviderMeta(provider);

  if (meta.logo === 'kbz') {
    return (
      <Image
        source={require('@/assets/images/kbz-pay.png')}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        resizeMode="cover"
      />
    );
  }
  if (meta.logo === 'wave') {
    return (
      <Image
        source={require('@/assets/images/wave-money.png')}
        style={{ width: size, height: size, borderRadius: size * 0.22 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View style={[s.iconWrap, { width: size, height: size, borderRadius: size * 0.22, backgroundColor: meta.cardBg }]}>
      <Ionicons name={meta.iconName} size={size * 0.45} color="#fff" />
    </View>
  );
}

const s = StyleSheet.create({
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
});
