import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { fetchFootballMatches } from "@/services/football";
import type { FootballMarket } from "@/types/football";
import {
  formatDrawDate,
  groupMatchesByLeague,
  reconcileLeagues,
  type UiLeagueData,
} from "@/utils/football-ui";
import {
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { InteractionManager } from "react-native";

export type ReloadOptions = { immediate?: boolean };

export function useFootballMatches(
  mode: "single" | "mix",
  options?: {
    drawDate?: Date;
    markets?: FootballMarket[];
    enabled?: boolean;
  },
) {
  const { token } = useAuth();
  const { lang } = useLanguage();
  const [leagues, setLeagues] = useState<UiLeagueData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const leaguesRef = useRef(leagues);
  leaguesRef.current = leagues;
  const requestIdRef = useRef(0);
  const inflightRef = useRef(false);
  const errorRef = useRef(error);
  errorRef.current = error;

  const drawDate = options?.drawDate;
  const enabled = options?.enabled !== false;
  const marketsKey = options?.markets?.join(",") ?? "";
  const markets = useMemo(
    () => options?.markets,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [marketsKey],
  );

  const drawDateStr = useMemo(
    () => formatDrawDate(drawDate ?? new Date()),
    [drawDate?.toDateString()],
  );

  // Stop work immediately on blur, but free match data only after the
  // leave transition so exiting the screen stays smooth.
  useEffect(() => {
    if (enabled) return;

    requestIdRef.current += 1;
    inflightRef.current = false;
    setLoading(false);

    const task = InteractionManager.runAfterInteractions(() => {
      setError(null);
      setLeagues([]);
    });
    return () => task.cancel();
  }, [enabled]);

  const load = useCallback(async (reloadOpts?: ReloadOptions) => {
    if (!enabled || !token) {
      setLoading(false);
      return;
    }
    // Avoid stacking polls while a request is still running.
    // Pull-to-refresh can cancel a deferred background poll.
    if (inflightRef.current) {
      if (!reloadOpts?.immediate) return;
      requestIdRef.current += 1;
      inflightRef.current = false;
    }

    const requestId = ++requestIdRef.current;
    inflightRef.current = true;
    const isInitial = leaguesRef.current.length === 0;
    const immediate = isInitial || reloadOpts?.immediate === true;
    if (isInitial) setLoading(true);
    if (errorRef.current) setError(null);

    try {
      // Wait until taps/scrolls finish so JSON parse does not stall selection.
      if (!immediate) {
        await new Promise<void>((resolve) => {
          InteractionManager.runAfterInteractions(() => resolve());
        });
        if (requestId !== requestIdRef.current) return;
      }

      const data = await fetchFootballMatches(token, drawDateStr);
      if (requestId !== requestIdRef.current) return;
      const grouped = groupMatchesByLeague(data.matches, mode, lang, markets);
      const apply = () => {
        if (requestId !== requestIdRef.current) return;
        setLeagues((prev) => reconcileLeagues(prev, grouped));
      };
      if (immediate) {
        apply();
      } else {
        startTransition(apply);
      }
    } catch (e) {
      if (requestId !== requestIdRef.current) return;
      setError(e instanceof Error ? e.message : "Failed to load matches");
      if (isInitial) setLeagues([]);
    } finally {
      if (requestId === requestIdRef.current) {
        inflightRef.current = false;
        setLoading(false);
      }
    }
  }, [enabled, token, drawDateStr, mode, lang, markets]);

  useEffect(() => {
    if (!enabled) return;
    void load({ immediate: true });
  }, [enabled, load]);

  const showLoading = loading && leagues.length === 0;

  return { leagues, loading: showLoading, error, reload: load };
}
