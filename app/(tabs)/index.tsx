import { LoginPromptCard } from "@/components/login-prompt-card";
import { ActivitySheet } from "@/components/activity-sheet";
import {
  BorderRadius,
  Colors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import { useAppConfig } from "@/contexts/app-config";
import { useAuth } from "@/contexts/auth";
import { useLanguage } from "@/contexts/language";
import { useAuthGate } from "@/hooks/use-auth-gate";
import type { MeUser } from "@/types/api";
import { formatBalance } from "@/utils/format-balance";
import { Ionicons } from "@expo/vector-icons";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MENU_ROUTES: Record<string, string> = {
  rule: "/(tabs)/rule",
  pw: "/(tabs)/change-password",
  deposit: "/(tabs)/auto-deposit",
  withdraw: "/(tabs)/withdraw",
  score: "/(tabs)/scores",
  mix: "/(tabs)/maung",
  hdp: "/(tabs)/hdp",
  betlist: "/(tabs)/bets",
  news: "/(tabs)/news",
};

// ─── Ticker ───────────────────────────────────────────────────────────────────

function AnnouncementBanner({ text }: { text: string }) {
  const x = useRef(new Animated.Value(0)).current;
  const [cw, setCw] = useState(0);
  const [tw, setTw] = useState(0);

  useEffect(() => {
    if (!cw || !tw) return;
    x.setValue(cw);
    Animated.loop(
      Animated.timing(x, {
        toValue: -tw,
        duration: (cw + tw) * 24,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    ).start();
  }, [cw, tw]);

  return (
    <View style={s.announce}>
      <View style={s.announceIcon}>
        <Ionicons name="megaphone" size={14} color={Colors.brand.greenDark} />
      </View>
      <View
        style={s.announceTrack}
        onLayout={(e) => setCw(e.nativeEvent.layout.width)}
      >
        <Animated.Text
          style={[
            s.announceText,
            { transform: [{ translateX: x }], position: "absolute" },
          ]}
          onLayout={(e) => setTw(e.nativeEvent.layout.width)}
          numberOfLines={1}
        >
          {text}
        </Animated.Text>
      </View>
    </View>
  );
}

// ─── Wallet card ──────────────────────────────────────────────────────────────

function WalletCard({
  user,
  onRefresh,
  refreshing,
}: {
  user: MeUser;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const { tr, lang } = useLanguage();
  const spin = useRef(new Animated.Value(0)).current;
  const anim = useRef<Animated.CompositeAnimation | null>(null);

  function handleRefresh() {
    anim.current?.stop();
    spin.setValue(0);
    anim.current = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 700,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    anim.current.start();
    onRefresh();
    setTimeout(() => {
      anim.current?.stop();
      spin.setValue(0);
    }, 1800);
  }

  const rotate = spin.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  const cashOut = user.cash_out_id ?? user.cash_out ?? "—";

  const stats = [
    { key: "profilePhone" as const, value: user.phone ?? "—" },
    { key: "profileCashOut" as const, value: cashOut },
    { key: "profileCashCode" as const, value: user.cash_code ?? "—" },
  ];

  return (
    <View style={s.wallet}>
      <View style={s.walletOrb1} />
      <View style={s.walletOrb2} />

      <View style={s.walletTop}>
        <View style={s.walletUser}>
          <View style={s.walletAvatar}>
            <Ionicons name="person" size={18} color={Colors.brand.greenMid} />
          </View>
          <View style={s.walletUserText}>
            <Text style={s.walletName}>{user.username}</Text>
            <Text style={s.walletBalanceInline}>
              {tr.profileBalance}: {formatBalance(user.balance, lang)}{" "}
              {tr.currencyUnit}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={handleRefresh}
          style={s.walletRefresh}
          activeOpacity={0.7}
          disabled={refreshing}
        >
          <Animated.View style={{ transform: [{ rotate }] }}>
            <Ionicons name="refresh" size={18} color="rgba(255,255,255,0.9)" />
          </Animated.View>
        </TouchableOpacity>
      </View>

      <View style={s.walletStats}>
        {stats.map((item, i) => (
          <View
            key={item.key}
            style={[s.walletStat, i > 0 && s.walletStatBorder]}
          >
            <Text style={s.walletStatLabel}>{tr[item.key]}</Text>
            <Text style={s.walletStatValue} numberOfLines={1}>
              {item.value}
            </Text>
          </View>
        ))}
      </View>

      <View style={s.walletActions}>
        <TouchableOpacity
          style={s.walletBtnPrimary}
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/auto-deposit" as never)}
        >
          <Ionicons
            name="add-circle"
            size={18}
            color={Colors.brand.greenDark}
          />
          <Text style={s.walletBtnPrimaryText}>{tr.homeDeposit}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.walletBtnGhost} activeOpacity={0.85} onPress={() => router.push("/(tabs)/withdraw" as never)}>
          <Ionicons name="arrow-up-circle-outline" size={18} color="#fff" />
          <Text style={s.walletBtnGhostText}>{tr.homeWithdraw}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={s.walletBtnGhost}
          activeOpacity={0.85}
          onPress={() => router.push("/(tabs)/coin-transactions" as never)}
        >
          <Ionicons name="time-outline" size={18} color="#fff" />
          <Text style={s.walletBtnGhostText}>{tr.homeHistory}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Menu tiles ───────────────────────────────────────────────────────────────

type MenuEntry = {
  id: string;
  labelKey: string;
  icon: keyof typeof Ionicons.glyphMap;
  bg: string;
  featured?: boolean;
};

function QuickTile({ item }: { item: MenuEntry }) {
  const { tr } = useLanguage();
  const { navigate } = useAuthGate();
  const route = MENU_ROUTES[item.id];

  return (
    <Pressable
      style={({ pressed }) => [s.quickTile, pressed && s.tilePressed]}
      onPress={() => navigate(item.id, route)}
    >
      <View style={[s.quickIcon, { backgroundColor: item.bg }]}>
        <Ionicons name={item.icon} size={24} color="#fff" />
      </View>
      <Text style={s.quickLabel} numberOfLines={2}>
        {(tr as Record<string, string>)[item.labelKey]}
      </Text>
    </Pressable>
  );
}

function ServiceTile({ item }: { item: MenuEntry }) {
  const { tr } = useLanguage();
  const { navigate } = useAuthGate();
  const route = MENU_ROUTES[item.id];

  return (
    <Pressable
      style={({ pressed }) => [s.serviceTile, pressed && s.tilePressed]}
      onPress={() => navigate(item.id, route)}
    >
      <View style={[s.serviceIcon, { backgroundColor: item.bg + "18" }]}>
        <Ionicons name={item.icon} size={22} color={item.bg} />
      </View>
      <Text style={s.serviceLabel} numberOfLines={2}>
        {(tr as Record<string, string>)[item.labelKey]}
      </Text>
    </Pressable>
  );
}

const QUICK_PLAY: MenuEntry[] = [
  { id: "mix", labelKey: "menuMixParlay", icon: "trophy", bg: "#27AE60" },
  { id: "hdp", labelKey: "menuHDP", icon: "football", bg: "#2980B9" },
  { id: "score", labelKey: "menuScore", icon: "pulse", bg: "#E74C3C" },
  { id: "news", labelKey: "menuNews", icon: "newspaper", bg: "#34495E" },
];

const SERVICES: MenuEntry[] = [
  {
    id: "betlist",
    labelKey: "menuBetList",
    icon: "document-text",
    bg: "#16A085",
  },
  {
    id: "deposit",
    labelKey: "menuDeposit",
    icon: "arrow-down-circle",
    bg: "#E67E22",
  },
  { id: "withdraw", labelKey: "menuWithdraw", icon: "wallet", bg: "#F39C12" },
  { id: "rule", labelKey: "menuRule", icon: "book-outline", bg: "#1ABC9C" },
  { id: "pw", labelKey: "menuChangePw", icon: "lock-closed", bg: "#9B59B6" },
];

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function HomeScreen() {
  const { tr } = useLanguage();
  const tabBarHeight = useBottomTabBarHeight();
  const { isAuthenticated, user, isRefreshing, refreshUser, isLoading } =
    useAuth();

  const { application, refresh: refreshApp } = useAppConfig();
  const [refreshing, setRefreshing] = useState(false);
  const [activitySheetOpen, setActivitySheetOpen] = useState(false);

  const announcement =
    application?.interface_content?.trim() || tr.announcement;
  const appSubtitle = application?.app_title?.trim() || "မောင်း";

  async function handleRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([
        refreshApp(),
        isAuthenticated ? refreshUser() : Promise.resolve(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }

  return (
    <View style={s.root}>
      <SafeAreaView edges={["top"]} style={s.headerSafe}>
        <View style={s.header}>
          <View style={s.headerLogo}>
            <Text style={s.logoBet}>bet</Text>
            <Text style={s.logo365}>365</Text>
            <Text style={s.logoSub}>{appSubtitle}</Text>
          </View>
          <View style={s.headerActions}>
            {isAuthenticated ? (
              <TouchableOpacity
                style={s.headerIconBtn}
                activeOpacity={0.7}
                onPress={() => setActivitySheetOpen(true)}
              >
                <Ionicons name="notifications-outline" size={20} color="#fff" />
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity
              style={s.headerIconBtn}
              activeOpacity={0.7}
              onPress={() =>
                isAuthenticated
                  ? router.push("/profile" as never)
                  : router.push("/login")
              }
            >
              <Ionicons
                name="person"
                size={18}
                color={Colors.brand.greenDark}
              />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={[
          s.scrollContent,
          { paddingBottom: tabBarHeight + Spacing.md },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={Colors.brand.greenButton}
          />
        }
      >
        <View style={s.sheet}>
          {!isLoading && isAuthenticated && user ? (
            <WalletCard
              user={user}
              onRefresh={refreshUser}
              refreshing={isRefreshing}
            />
          ) : !isLoading ? (
            <LoginPromptCard />
          ) : (
            <View style={s.walletPlaceholder} />
          )}
          <AnnouncementBanner text={announcement} />

          <Text style={s.sectionTitle}>{tr.homeQuickPlay}</Text>
          <View style={s.quickRow}>
            {QUICK_PLAY.map((item) => (
              <QuickTile key={item.id} item={item} />
            ))}
          </View>

          <Text style={s.sectionTitle}>{tr.homeAllServices}</Text>
          <View style={s.serviceGrid}>
            {SERVICES.map((item) => (
              <ServiceTile key={item.id} item={item} />
            ))}
          </View>
        </View>
      </ScrollView>

      <ActivitySheet
        visible={activitySheetOpen}
        onClose={() => setActivitySheetOpen(false)}
      />
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#F2F5F3" },
  headerSafe: { backgroundColor: Colors.brand.greenButton },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: Spacing.md,
    paddingBottom: 6,
  },
  headerLogo: { flexDirection: "row", alignItems: "baseline", gap: 0 },
  logoBet: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: "#fff",
    letterSpacing: -0.5,
  },
  logo365: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.extrabold,
    color: Colors.brand.gold,
    letterSpacing: -0.5,
  },
  logoSub: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: "rgba(255,255,255,0.75)",
    marginLeft: 4,
    marginBottom: 1,
  },
  headerActions: { flexDirection: "row", gap: 6 },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  notifDot: {
    position: "absolute",
    top: 6,
    right: 7,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: Colors.brand.gold,
    borderWidth: 1.5,
    borderColor: Colors.brand.greenButton,
  },
  scroll: {
    flex: 1,
    backgroundColor: "#F2F5F3",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
  },
  scrollContent: { flexGrow: 1 },
  sheet: {
    flex: 1,
    backgroundColor: "#F2F5F3",
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  walletPlaceholder: {
    height: 140,
    backgroundColor: Colors.brand.greenDark,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    opacity: 0.35,
  },
  wallet: {
    backgroundColor: Colors.brand.greenDark,
    borderRadius: BorderRadius.lg,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    overflow: "hidden",
    ...Shadow.md,
  },
  walletOrb1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255,255,255,0.07)",
    top: -40,
    right: -25,
  },
  walletOrb2: {
    position: "absolute",
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.05)",
    bottom: 10,
    left: -15,
  },
  walletTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: Spacing.sm,
  },
  walletUser: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    flex: 1,
  },
  walletUserText: { flex: 1 },
  walletAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  walletName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  walletBalanceInline: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.extrabold,
    color: "#fff",
    letterSpacing: -0.3,
    marginTop: 1,
  },
  walletRefresh: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  walletStats: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.15)",
    borderRadius: BorderRadius.md,
    paddingVertical: 6,
    marginBottom: Spacing.sm,
  },
  walletStat: { flex: 1, alignItems: "center", paddingHorizontal: 2 },
  walletStatBorder: {
    borderLeftWidth: 1,
    borderLeftColor: "rgba(255,255,255,0.15)",
  },
  walletStatLabel: {
    fontSize: 9,
    color: "rgba(255,255,255,0.55)",
    textAlign: "center",
  },
  walletStatValue: {
    fontSize: 11,
    fontWeight: FontWeight.bold,
    color: "#fff",
    textAlign: "center",
    marginTop: 1,
  },
  walletActions: { flexDirection: "row", gap: Spacing.sm },
  walletBtnPrimary: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: Colors.brand.gold,
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  walletBtnPrimaryText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.bold,
    color: Colors.brand.greenDark,
  },
  walletBtnGhost: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    borderWidth: 1.5,
    borderColor: "rgba(255,255,255,0.45)",
    paddingVertical: 9,
    borderRadius: BorderRadius.md,
  },
  walletBtnGhostText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
    color: "#fff",
  },
  announce: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: BorderRadius.md,
    paddingVertical: 8,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
    ...Shadow.sm,
  },
  announceIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.brand.gold + "44",
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.sm,
  },
  announceTrack: {
    flex: 1,
    overflow: "hidden",
    height: 18,
    justifyContent: "center",
  },
  announceText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginBottom: Spacing.sm,
  },
  quickRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.lg,
    gap: Spacing.sm,
  },
  quickTile: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 6,
    alignItems: "center",
    ...Shadow.sm,
  },
  quickIcon: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 14,
  },
  serviceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  serviceTile: {
    width: "31%",
    backgroundColor: "#fff",
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.md,
    paddingHorizontal: 6,
    alignItems: "center",
    ...Shadow.sm,
  },
  serviceIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  serviceLabel: {
    fontSize: 11,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    textAlign: "center",
    lineHeight: 14,
  },
  tilePressed: { opacity: 0.88, transform: [{ scale: 0.98 }] },
});
