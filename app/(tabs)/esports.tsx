import { FootballBetScreen } from '@/components/football-bet-screen';
import { useLanguage } from '@/contexts/language';

export default function EsportsScreen() {
  const { tr } = useLanguage();
  return (
    <FootballBetScreen
      title={tr.esportsTitle}
      mode="single"
      markets={['to_win']}
      minPicks={1}
      stakePlaceholder="1000"
      hint={tr.footballSinglePickHint}
      minErr={tr.footballSinglePickErr}
      source="esports"
    />
  );
}
