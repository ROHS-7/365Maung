import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function CorrectScoreScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.footballCorrectScoreTitle}
      mode="single"
      markets={['correct_score']}
      minPicks={1}
      stakePlaceholder="500"
      hint={tr.footballSinglePickHint}
      minErr={tr.footballSinglePickErr}
    />
  );
}
