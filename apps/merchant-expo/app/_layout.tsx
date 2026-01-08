import { Stack } from "expo-router";
import "../global.css";
import { Providers } from "./providers";

export default function Layout() {
  return (
    <Providers>
      <Stack>
        <Stack.Screen name="index" options={{ title: "Home" }} />
      </Stack>
    </Providers>
  );
}
