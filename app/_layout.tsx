import { Stack } from "expo-router";
import { SnackbarProvider } from "../src/contexts/SnackbarContext";

export default function RootLayout() {
  return (
    <SnackbarProvider>
      <Stack screenOptions={{
        headerShown: false,
      }}>
        <Stack.Screen name="(tabs)" />
      </Stack>
    </SnackbarProvider>
  );
}
