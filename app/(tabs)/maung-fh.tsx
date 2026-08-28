import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function MaungFhScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.maungFhTitle}
      mode="mix"
      markets={['asian_handicap_fh', 'goals_ou_fh', 'sone_ma']}
      period="fh"
      minPicks={2}
      stakePlaceholder="500"
      hint={tr.maungMinPicksHint}
      minErr={tr.maungMinErr}
    />
  );
}
