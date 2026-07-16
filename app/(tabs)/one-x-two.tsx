import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function OneXTwoScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.football1x2Title}
      mode="single"
      markets={['match_winner_1x2']}
      minPicks={1}
      stakePlaceholder="1000"
      hint={tr.footballSinglePickHint}
      minErr={tr.footballSinglePickErr}
    />
  );
}
