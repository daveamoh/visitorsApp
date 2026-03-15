import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { View, Text, Image } from "react-native";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerTitleAlign: "center",
        // Tab bar
        tabBarStyle: {
          backgroundColor: "#030624",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: "#da261c",
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        // Header
        headerStyle: {
          backgroundColor: "#030624",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.1)",
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: "#fff",
      }}
    >
      <Tabs.Screen
        name="checkin"
        options={{
          title: "Check In",
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/images/icos.webp")}
                style={{ width: 30, height: 30, marginRight: 8, borderRadius: 6 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
                AT Visitors
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-in" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="checkout"
        options={{
          title: "Check Out",
          headerTitle: () => (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={require("../../assets/images/icos.webp")}
                style={{ width: 30, height: 30, marginRight: 8, borderRadius: 6 }}
                resizeMode="contain"
              />
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}>
                AT Visitors
              </Text>
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="log-out" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}