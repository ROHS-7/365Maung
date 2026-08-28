import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function HdpFhScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.hdpFhTitle}
      mode="single"
      markets={['asian_handicap_fh', 'goals_ou_fh', 'sone_ma']}
      period="fh"
      minPicks={1}
      stakePlaceholder="5000"
      hint={tr.hdpMinPicksHint}
      minErr={tr.hdpMinErr}
    />
  );
}
