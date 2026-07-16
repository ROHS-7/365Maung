import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function SoneMaScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.footballSoneMaTitle}
      mode="single"
      markets={['sone_ma']}
      minPicks={1}
      stakePlaceholder="1000"
      hint={tr.footballSinglePickHint}
      minErr={tr.footballSinglePickErr}
    />
  );
}
