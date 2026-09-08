import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { requestOtp } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui";
import { theme } from "@/lib/theme";

export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const params = useLocalSearchParams<{ phone: string; devCode?: string }>();
  const phone = String(params.phone ?? "");
  const [code, setCode] = useState(String(params.devCode ?? ""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      await login(phone, code.trim());
      router.replace("/home");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Pogrešan kod.");
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
    setError(null);
    try {
      const { devCode } = await requestOtp(phone);
      if (devCode) setCode(devCode);
    } catch {
      setError("Slanje koda nije uspelo.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.back}>‹ Nazad</Text>
        </Pressable>

        <Text style={styles.title}>Unesi kod</Text>
        <Text style={styles.subtitle}>
          Poslali smo šestocifreni kod na{"\n"}
          <Text style={styles.phone}>{phone}</Text>
        </Text>

        <TextInput
          style={styles.codeInput}
          value={code}
          onChangeText={(t) => setCode(t.replace(/\D/g, "").slice(0, 6))}
          placeholder="000000"
          placeholderTextColor={theme.colors.textFaint}
          keyboardType="number-pad"
          autoFocus
          maxLength={6}
          editable={!loading}
        />

        {params.devCode ? (
          <View style={styles.devBanner}>
            <Text style={styles.devText}>
              🔓 Demo režim: kod je automatski popunjen ({String(params.devCode)}).
              U produkciji stiže SMS-om.
            </Text>
          </View>
        ) : null}

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <Button
          title="Potvrdi"
          onPress={submit}
          loading={loading}
          disabled={code.length < 4}
          style={{ marginTop: 24 }}
        />

        <Pressable onPress={resend} style={styles.resend} hitSlop={8}>
          <Text style={styles.resendText}>Pošalji kod ponovo</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  back: { fontSize: 17, color: theme.colors.textMuted, marginBottom: 24 },
  title: { fontSize: 32, fontWeight: "800", color: theme.colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 16, color: theme.colors.textMuted, marginTop: 10, lineHeight: 24 },
  phone: { fontWeight: "700", color: theme.colors.text },
  codeInput: {
    height: 72,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.bgMuted,
    marginTop: 32,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: 12,
    textAlign: "center",
    color: theme.colors.text,
  },
  devBanner: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    padding: 12,
    marginTop: 16,
  },
  devText: { color: theme.colors.primaryDark, fontSize: 13, lineHeight: 19 },
  error: { color: theme.colors.danger, marginTop: 14, fontSize: 14, fontWeight: "600" },
  resend: { alignSelf: "center", marginTop: 24, padding: 8 },
  resendText: { color: theme.colors.primary, fontSize: 15, fontWeight: "700" },
});
