import { useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { requestOtp } from "@/lib/api";
import { Button } from "@/components/ui";
import { theme } from "@/lib/theme";

export default function PhoneScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phone, setPhone] = useState("+381");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setError(null);
    setLoading(true);
    try {
      const { devCode } = await requestOtp(phone.trim());
      router.push({
        pathname: "/verify",
        params: { phone: phone.trim(), devCode: devCode ?? "" },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Došlo je do greške.");
    } finally {
      setLoading(false);
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
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.logoWrap}>
          <Text style={styles.logo}>Probaj</Text>
          <Text style={styles.spark}>✨</Text>
        </View>
        <Text style={styles.tagline}>
          Vidi kako ti stoji pre nego što kupiš.
        </Text>

        <View style={styles.form}>
          <Text style={styles.label}>Broj telefona</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="+381 6X XXX XXXX"
            placeholderTextColor={theme.colors.textFaint}
            keyboardType="phone-pad"
            autoFocus
            editable={!loading}
          />
          <Text style={styles.helper}>
            Poslaćemo ti SMS kod za potvrdu. Nema lozinki.
          </Text>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            title="Pošalji kod"
            onPress={submit}
            loading={loading}
            disabled={phone.trim().length < 8}
            style={{ marginTop: 20 }}
          />
        </View>

        <Text style={styles.terms}>
          Nastavkom prihvataš uslove korišćenja i politiku privatnosti. Tvoje
          fotografije se koriste samo za probu i ne dele se ni sa kim.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: theme.colors.bg },
  container: { flexGrow: 1, paddingHorizontal: 24 },
  logoWrap: { flexDirection: "row", alignItems: "flex-start" },
  logo: { fontSize: 44, fontWeight: "800", color: theme.colors.primary, letterSpacing: -1 },
  spark: { fontSize: 24, marginTop: 4 },
  tagline: {
    fontSize: 18,
    color: theme.colors.textMuted,
    marginTop: 8,
    lineHeight: 26,
    maxWidth: 300,
  },
  form: { marginTop: 48 },
  label: { fontSize: 14, fontWeight: "700", color: theme.colors.text, marginBottom: 8 },
  input: {
    height: 56,
    borderRadius: theme.radius.md,
    borderWidth: 1.5,
    borderColor: theme.colors.border,
    paddingHorizontal: 16,
    fontSize: 18,
    color: theme.colors.text,
    backgroundColor: theme.colors.bgMuted,
  },
  helper: { fontSize: 13, color: theme.colors.textFaint, marginTop: 8 },
  error: { color: theme.colors.danger, marginTop: 14, fontSize: 14, fontWeight: "600" },
  terms: {
    fontSize: 12,
    color: theme.colors.textFaint,
    marginTop: "auto",
    paddingTop: 40,
    lineHeight: 18,
  },
});
