import { Image } from "expo-image";
import { Redirect, useLocalSearchParams, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Platform,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui";
import { theme } from "@/lib/theme";

export default function ResultScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { ready, token, credits } = useAuth();
  const params = useLocalSearchParams<{
    result: string;
    person?: string;
    garment?: string;
    provider?: string;
  }>();

  if (!ready)
    return (
      <View style={styles.loadingScreen}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
      </View>
    );
  if (!token) return <Redirect href="/phone" />;

  const result = String(params.result ?? "");
  const isMock = params.provider === "mock";

  const share = async () => {
    try {
      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ url: result, title: "Moja proba na Probaj ✨" });
      } else {
        await Share.share({ message: result });
      }
    } catch {
      // user cancelled / unsupported
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
      <View style={styles.topRow}>
        <Pressable onPress={() => router.replace("/home")} hitSlop={12}>
          <Text style={styles.back}>‹ Nazad</Text>
        </Pressable>
        <View style={styles.creditChip}>
          <Text style={styles.creditChipText}>💎 {credits}</Text>
        </View>
      </View>

      <Text style={styles.title}>Evo kako ti stoji ✨</Text>

      <View style={styles.resultWrap}>
        <Image source={{ uri: result }} style={styles.resultImage} contentFit="cover" />
      </View>

      {isMock ? (
        <View style={styles.demoBanner}>
          <Text style={styles.demoText}>
            🔧 Demo rezultat (FAL_KEY nije podešen na serveru). Kada je AI ključ
            aktivan, ovde se prikazuje pravo virtuelno probavanje.
          </Text>
        </View>
      ) : null}

      {params.person && params.garment ? (
        <View style={styles.thumbs}>
          <View style={styles.thumbCol}>
            <Image source={{ uri: String(params.person) }} style={styles.thumb} contentFit="cover" />
            <Text style={styles.thumbLabel}>Ti</Text>
          </View>
          <Text style={styles.plus}>+</Text>
          <View style={styles.thumbCol}>
            <Image source={{ uri: String(params.garment) }} style={styles.thumb} contentFit="cover" />
            <Text style={styles.thumbLabel}>Predmet</Text>
          </View>
        </View>
      ) : null}

      <Button title="Podeli rezultat" onPress={share} variant="secondary" style={{ marginTop: 24 }} />
      <Button
        title="Nova proba"
        onPress={() => router.replace("/home")}
        style={{ marginTop: 12 }}
      />
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
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  back: { fontSize: 17, color: theme.colors.textMuted },
  creditChip: {
    backgroundColor: theme.colors.primarySoft,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
  },
  creditChipText: { color: theme.colors.primaryDark, fontWeight: "800", fontSize: 15 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: theme.colors.text,
    marginBottom: 18,
    letterSpacing: -0.5,
  },
  resultWrap: {
    borderRadius: theme.radius.lg,
    overflow: "hidden",
    backgroundColor: theme.colors.bgMuted,
    aspectRatio: 3 / 4,
  },
  resultImage: { width: "100%", height: "100%" },
  demoBanner: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginTop: 16,
  },
  demoText: { color: theme.colors.primaryDark, fontSize: 13, lineHeight: 19 },
  thumbs: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    marginTop: 22,
  },
  thumbCol: { alignItems: "center" },
  thumb: {
    width: 70,
    height: 90,
    borderRadius: theme.radius.sm,
    backgroundColor: theme.colors.bgMuted,
  },
  thumbLabel: { fontSize: 12, color: theme.colors.textFaint, marginTop: 6, fontWeight: "600" },
  plus: { fontSize: 22, color: theme.colors.textFaint, fontWeight: "700" },
});
