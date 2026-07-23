import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function HdpScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.hdpTitle}
      mode="single"
      markets={['asian_handicap', 'goals_ou']}
      minPicks={1}
      stakePlaceholder="5000"
      hint={tr.hdpMinPicksHint}
      minErr={tr.hdpMinErr}
    />
  );
}
