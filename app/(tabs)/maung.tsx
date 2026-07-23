import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function MaungScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.maungTitle}
      mode="mix"
      markets={['asian_handicap', 'goals_ou']}
      minPicks={2}
      stakePlaceholder="500"
      hint={tr.maungMinPicksHint}
      minErr={tr.maungMinErr}
    />
  );
}
