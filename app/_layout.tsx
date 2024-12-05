import React,{ Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      {/* Default index screen */}
      <Stack.Screen name="index" options={{ headerShown: false }} />

      {/* Auth screens */}
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />

      {/* Scanner screens */}
      <Stack.Screen name="(scanner)" options={{ headerShown: false }} />
    </Stack>
  );
}
