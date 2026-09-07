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
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui";
import { CREDIT_PACKS } from "@/lib/config";
import { buyPack, purchasesBackend } from "@/lib/purchases";
import { theme } from "@/lib/theme";

export default function PaywallScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, token, credits, setCredits, refresh } = useAuth();
  const [selected, setSelected] = useState<string>("credits_20");
  const [loading, setLoading] = useState(false);

  if (!ready)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  if (!token) return <Redirect href="/phone" />;

  const onBuy = async () => {
    const pack = CREDIT_PACKS.find((p) => p.id === selected);
    if (!pack) return;
    setLoading(true);
    try {
      const res = await buyPack(token, { id: pack.id, credits: pack.credits });
      if (res.credits != null) {
        setCredits(res.credits);
      } else {
        // RevenueCat purchase — credits arrive via webhook; refetch.
        await refresh();
      }
      Alert.alert("Uspešno!", `Dodato ${pack.credits} kredita.`, [
        { text: "Super", onPress: () => router.back() },
      ]);
    } catch (e) {
      Alert.alert(
        "Kupovina nije uspela",
        e instanceof Error ? e.message : "Pokušaj ponovo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={styles.flex}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 32 },
      ]}
    >
      <Pressable onPress={() => router.back()} hitSlop={12}>
        <Text style={styles.back}>‹ Nazad</Text>
      </Pressable>

      <Text style={styles.title}>Kupi kredite</Text>
      <Text style={styles.sub}>
        1 kredit = 1 proba. Trenutno stanje:{" "}
        <Text style={styles.creditsInline}>💎 {credits}</Text>
      </Text>

      <View style={styles.packs}>
        {CREDIT_PACKS.map((pack) => {
          const active = pack.id === selected;
          return (
            <Pressable
              key={pack.id}
              onPress={() => setSelected(pack.id)}
              style={[styles.pack, active && styles.packActive]}
            >
              <View style={styles.packLeft}>
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <View>
                  <Text style={styles.packCredits}>
                    {pack.credits} {pack.credits === 1 ? "kredit" : "kredita"}
                  </Text>
                  <Text style={styles.packLabel}>{pack.label}</Text>
                </View>
              </View>
              <View style={styles.packRight}>
                {"best" in pack && pack.best ? (
                  <View style={styles.bestBadge}>
                    <Text style={styles.bestText}>NAJBOLJE</Text>
                  </View>
                ) : null}
                <Text style={styles.packPrice}>{pack.price}</Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Button
        title="Kupi"
        onPress={onBuy}
        loading={loading}
        style={{ marginTop: 24 }}
      />

      <Text style={styles.note}>
        {purchasesBackend === "revenuecat"
          ? "Naplata je obezbeđena preko RevenueCat-a (App Store / Google Play)."
          : "Demo režim naplate. U produkciji se koristi RevenueCat (App Store / Google Play)."}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  loadingScreen: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.bg,
  },
  container: { paddingHorizontal: 20 },
  back: { fontSize: 17, color: theme.colors.textMuted, marginBottom: 16 },
  title: { fontSize: 30, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.5 },
  sub: { fontSize: 15, color: theme.colors.textMuted, marginTop: 8 },
  creditsInline: { fontWeight: "800", color: theme.colors.primaryDark },
  packs: { marginTop: 24, gap: 12 },
  pack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: 16,
    backgroundColor: theme.colors.card,
  },
  packActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primarySoft,
  },
  packLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  radioActive: { borderColor: theme.colors.primary },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.primary,
  },
  packCredits: { fontSize: 17, fontWeight: "800", color: theme.colors.text },
  packLabel: { fontSize: 13, color: theme.colors.textMuted, marginTop: 2 },
  packRight: { alignItems: "flex-end", gap: 6 },
  packPrice: { fontSize: 16, fontWeight: "700", color: theme.colors.text },
  bestBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: theme.radius.pill,
  },
  bestText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 0.5 },
  note: {
    fontSize: 12,
    color: theme.colors.textFaint,
    marginTop: 20,
    textAlign: "center",
    lineHeight: 18,
  },
});
