import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="screens" options={{ headerShown: false, gestureEnabled: false }}/>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  );
}
