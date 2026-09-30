import { useState } from "react";
import { StyleSheet, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Spacing } from "@/constants/theme";
import { requestMagicLink, verifyMagicLink } from "@/lib/session";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function sendCode() {
    setBusy(true);
    setMessage("");
    try {
      await requestMagicLink({ email: email.trim() });
      setMessage("Enter the 6-digit code from your email.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not send code"
      );
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setMessage("");
    try {
      await verifyMagicLink({ email: email.trim(), token: code.trim() });
      setMessage("Signed in.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not verify");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <ThemedText type="title">Sign in</ThemedText>
        <TextInput
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          onChangeText={setEmail}
          placeholder="Email"
          style={styles.input}
          value={email}
        />
        <ThemedText onPress={busy ? undefined : sendCode} type="linkPrimary">
          Send code
        </ThemedText>
        <TextInput
          keyboardType="number-pad"
          maxLength={6}
          onChangeText={setCode}
          placeholder="6-digit code"
          style={styles.input}
          value={code}
        />
        <ThemedText onPress={busy ? undefined : verify} type="linkPrimary">
          Verify
        </ThemedText>
        {message ? <ThemedText>{message}</ThemedText> : null}
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  input: {
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    padding: Spacing.two,
  },
  safeArea: {
    flex: 1,
    gap: Spacing.three,
    padding: Spacing.four,
  },
});
