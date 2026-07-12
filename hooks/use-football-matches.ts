import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { fetchFootballMatches } from '@/services/football';
import { formatDrawDate, groupMatchesByLeague, type UiLeagueData } from '@/utils/football-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useFootballMatches(mode: 'single' | 'mix', drawDate?: Date) {
  const { token } = useAuth();
  const { lang } = useLanguage();
  const [leagues, setLeagues] = useState<UiLeagueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const leaguesRef = useRef(leagues);
  leaguesRef.current = leagues;

  const drawDateStr = useMemo(
    () => formatDrawDate(drawDate ?? new Date()),
    [drawDate?.toDateString()],
  );

  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    const isInitial = leaguesRef.current.length === 0;
    if (isInitial) setLoading(true);
    setError(null);

    try {
      const data = await fetchFootballMatches(token, drawDateStr);
      setLeagues(groupMatchesByLeague(data.matches, mode, lang));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load matches');
      if (isInitial) setLeagues([]);
    } finally {
      setLoading(false);
    }
  }, [token, drawDateStr, mode, lang]);

  useEffect(() => {
    load();
  }, [load]);

  const showLoading = loading && leagues.length === 0;

  return { leagues, loading: showLoading, error, reload: load };
}
