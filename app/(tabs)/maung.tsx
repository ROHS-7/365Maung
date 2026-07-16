import { FootballBetScreen, ALL_MARKETS } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function MaungScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.maungTitle}
      mode="mix"
      markets={ALL_MARKETS}
      minPicks={2}
      stakePlaceholder="500"
      hint={tr.maungMinPicksHint}
      minErr={tr.maungMinErr}
    />
  );
}
