import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";
import React from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/lib/theme";
import type { PickedImage } from "@/lib/api";

export function PhotoSlot({
  label,
  hint,
  emoji,
  image,
  onPick,
}: {
  label: string;
  hint: string;
  emoji: string;
  image: PickedImage | null;
  onPick: (img: PickedImage) => void;
}) {
  const pick = async (fromCamera: boolean) => {
    try {
      if (fromCamera && Platform.OS !== "web") {
        const perm = await ImagePicker.requestCameraPermissionsAsync();
        if (!perm.granted) return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ quality: 0.9 })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ["images"],
            quality: 0.9,
          });
      if (!result.canceled && result.assets[0]) {
        const a = result.assets[0];
        onPick({ uri: a.uri, mimeType: a.mimeType, fileName: a.fileName });
      }
    } catch (e) {
      Alert.alert("Greška", e instanceof Error ? e.message : "Neuspešan odabir slike.");
    }
  };

  const choose = () => {
    if (Platform.OS === "web") {
      pick(false);
      return;
    }
    Alert.alert(label, "Izaberi izvor fotografije", [
      { text: "Kamera", onPress: () => pick(true) },
      { text: "Galerija", onPress: () => pick(false) },
      { text: "Otkaži", style: "cancel" },
    ]);
  };

  return (
    <Pressable style={styles.slot} onPress={choose}>
      {image ? (
        <>
          <Image source={{ uri: image.uri }} style={styles.image} contentFit="cover" />
          <View style={styles.changeBadge}>
            <Text style={styles.changeText}>Promeni</Text>
          </View>
        </>
      ) : (
        <View style={styles.empty}>
          <Text style={styles.emoji}>{emoji}</Text>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.hint}>{hint}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: theme.radius.md,
    borderWidth: 2,
    borderColor: theme.colors.border,
    borderStyle: "dashed",
    backgroundColor: theme.colors.bgMuted,
    overflow: "hidden",
  },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 12 },
  emoji: { fontSize: 34, marginBottom: 8 },
  label: { fontSize: 15, fontWeight: "700", color: theme.colors.text, textAlign: "center" },
  hint: { fontSize: 12, color: theme.colors.textFaint, textAlign: "center", marginTop: 4 },
  image: { width: "100%", height: "100%" },
  changeBadge: {
    position: "absolute",
    bottom: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: theme.radius.pill,
  },
  changeText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
