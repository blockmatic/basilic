import { useState } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { loadCurrentUser, logoutSession } from "@/lib/session";

export default function AccountScreen() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    try {
      const body = await loadCurrentUser();
      setEmail(typeof body.user.email === "string" ? body.user.email : "");
      setName(typeof body.user.name === "string" ? body.user.name : "");
      setMessage("");
    } catch (error) {
      setEmail("");
      setName("");
      setMessage(error instanceof Error ? error.message : "Sign in required");
    }
  }

  async function logout() {
    await logoutSession();
    setEmail("");
    setName("");
    setMessage("Signed out.");
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Account</ThemedText>
        <ThemedText onPress={load} type="linkPrimary">
          Load account
        </ThemedText>
        {name ? <ThemedText>{name}</ThemedText> : null}
        {email ? <ThemedText>{email}</ThemedText> : null}
        {message ? <ThemedText>{message}</ThemedText> : null}
        <ThemedText onPress={logout} type="linkPrimary">
          Sign out
        </ThemedText>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
