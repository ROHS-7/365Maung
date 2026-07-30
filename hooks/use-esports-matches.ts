import { useAuth } from '@/contexts/auth';
import { useLanguage } from '@/contexts/language';
import { fetchEsportsMatches } from '@/services/esports';
import {
  formatDrawDate,
  groupEsportsMatchesByLeague,
} from '@/utils/esports-ui';
import type { UiLeagueData } from '@/utils/football-ui';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export function useEsportsMatches(options?: { drawDate?: Date; enabled?: boolean }) {
  const { token } = useAuth();
  const { lang } = useLanguage();
  const [leagues, setLeagues] = useState<UiLeagueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const leaguesRef = useRef(leagues);
  leaguesRef.current = leagues;

  const drawDate = options?.drawDate;
  const enabled = options?.enabled !== false;
  const drawDateStr = useMemo(
    () => formatDrawDate(drawDate ?? new Date()),
    [drawDate?.toDateString()],
  );

  const load = useCallback(async () => {
    if (!enabled || !token) {
      setLoading(false);
      return;
    }

    const isInitial = leaguesRef.current.length === 0;
    if (isInitial) setLoading(true);
    setError(null);

    try {
      const data = await fetchEsportsMatches(token, drawDateStr);
      setLeagues(groupEsportsMatchesByLeague(data.matches, lang));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load matches');
      if (isInitial) setLeagues([]);
    } finally {
      setLoading(false);
    }
  }, [enabled, token, drawDateStr, lang]);

  useEffect(() => {
    load();
  }, [load]);

  const showLoading = loading && leagues.length === 0;

  return { leagues, loading: showLoading, error, reload: load };
}
