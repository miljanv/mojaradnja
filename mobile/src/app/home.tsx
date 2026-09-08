import { Redirect, useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ApiError, runTryOn, type PickedImage } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button, Card, Pill } from "@/components/ui";
import { PhotoSlot } from "@/components/photo-slot";
import { theme } from "@/lib/theme";

const CATEGORIES = [
  { id: "one-pieces", label: "Haljine" },
  { id: "tops", label: "Gornji deo" },
  { id: "bottoms", label: "Donji deo" },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, token, credits, setCredits, logout } = useAuth();

  const [person, setPerson] = useState<PickedImage | null>(null);
  const [garment, setGarment] = useState<PickedImage | null>(null);
  const [category, setCategory] = useState<string>("one-pieces");
  const [loading, setLoading] = useState(false);

  if (!ready)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  if (!token) return <Redirect href="/phone" />;

  const canTry = person && garment && !loading;

  const onTry = async () => {
    if (!person || !garment) return;
    if (credits < 1) {
      router.push("/paywall");
      return;
    }
    setLoading(true);
    try {
      const res = await runTryOn(token, { person, garment, category });
      setCredits(res.credits);
      router.push({
        pathname: "/result",
        params: {
          result: res.resultImageUrl,
          person: person.uri,
          garment: garment.uri,
          provider: res.provider,
        },
      });
    } catch (e) {
      if (e instanceof ApiError && e.code === "AI_CREDITS_EXHAUSTED") {
        router.push("/paywall");
      } else {
        Alert.alert(
          "Probavanje nije uspelo",
          e instanceof Error ? e.message : "Pokušaj ponovo."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 },
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.logo}>Probaj ✨</Text>
        <View style={styles.headerRight}>
          <Pressable
            style={styles.creditChip}
            onPress={() => router.push("/paywall")}
          >
            <Text style={styles.creditChipText}>💎 {credits}</Text>
          </Pressable>
          <Pressable onPress={logout} hitSlop={8} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>Odjava</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.h1}>Probaj na sebi</Text>
      <Text style={styles.sub}>
        Dodaj svoju fotografiju i fotografiju odevnog predmeta — AI će ti pokazati
        kako ti stoji.
      </Text>

      <View style={styles.slots}>
        <PhotoSlot
          label="Tvoja fotografija"
          hint="Cela figura, jasno svetlo"
          emoji="🧍"
          image={person}
          onPick={setPerson}
        />
        <PhotoSlot
          label="Odevni predmet"
          hint="Fotografija proizvoda"
          emoji="👗"
          image={garment}
          onPick={setGarment}
        />
      </View>

      <Card style={{ marginTop: 20 }}>
        <Text style={styles.cardLabel}>Tip odeće</Text>
        <View style={styles.segment}>
          {CATEGORIES.map((c) => {
            const active = c.id === category;
            return (
              <Pressable
                key={c.id}
                onPress={() => setCategory(c.id)}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    active && styles.segmentTextActive,
                  ]}
                >
                  {c.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {loading ? (
        <Card style={styles.loadingCard}>
          <ActivityIndicator color={theme.colors.primary} />
          <Text style={styles.loadingText}>
            AI oblači tvoju fotografiju… ovo traje do 30 sekundi.
          </Text>
        </Card>
      ) : null}

      <Button
        title={credits >= 1 ? "Probaj  ·  1 kredit" : "Kupi kredite"}
        onPress={onTry}
        loading={loading}
        disabled={!canTry}
        style={{ marginTop: 20 }}
      />
      <View style={{ alignItems: "center", marginTop: 12 }}>
        <Pill
          label={credits >= 1 ? `Imaš ${credits} kredita` : "Nemaš kredita"}
          tone={credits >= 1 ? "success" : "muted"}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  container: { paddingHorizontal: 20 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  logo: { fontSize: 22, fontWeight: "800", color: theme.colors.primary },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 12 },
  creditChip: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  creditChipText: { color: theme.colors.primaryDark, fontWeight: "800", fontSize: 15 },
  logoutBtn: { padding: 4 },
  logoutText: { color: theme.colors.textFaint, fontSize: 13, fontWeight: "600" },
  h1: { fontSize: 28, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: theme.colors.textMuted, marginTop: 8, lineHeight: 22 },
  slots: { flexDirection: "row", gap: 14, marginTop: 22 },
  cardLabel: { fontSize: 14, fontWeight: "700", color: theme.colors.text, marginBottom: 12 },
  segment: {
    flexDirection: "row",
    backgroundColor: theme.colors.bgMuted,
    borderRadius: theme.radius.sm,
    padding: 4,
    gap: 4,
  },
  segmentItem: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: theme.radius.sm - 2,
    alignItems: "center",
  },
  segmentItemActive: {
    backgroundColor: theme.colors.white,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  segmentText: { fontSize: 14, fontWeight: "600", color: theme.colors.textMuted },
  segmentTextActive: { color: theme.colors.text, fontWeight: "700" },
  loadingCard: { marginTop: 20, flexDirection: "row", alignItems: "center", gap: 14 },
  loadingText: { flex: 1, color: theme.colors.textMuted, fontSize: 14, lineHeight: 20 },
});
