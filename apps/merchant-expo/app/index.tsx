import { View, Text } from "react-native";
import { Link } from "expo-router";

export default function Home() {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-bold mb-4">Welcome to Merchant App</Text>
      <Link href="/sign-in" className="text-blue-500 mb-2">
        Sign In
      </Link>
      <Link href="/sign-up" className="text-blue-500">
        Sign Up
      </Link>
    </View>
  );
}
