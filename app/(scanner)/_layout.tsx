// scanner/_layout.tsx
import React from "expo-router";
import { createStackNavigator } from '@react-navigation/stack';
import ScanningScreen from "./ScanningScreen";

const Stack = createStackNavigator();

export default function ScanningLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="ScanningScreen" options={{ headerShown: false }} component={ScanningScreen}/>
    </Stack.Navigator>
  );
}
