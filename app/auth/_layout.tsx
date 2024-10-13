import React from "expo-router";
import { createStackNavigator } from '@react-navigation/stack';
import SignUp from "./SignUp";
import SignIn from "./SignIn";
import SelectAvatar from "./SelectAvatar";

const Stack = createStackNavigator();

export default function AuthLayout() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="SignIn" options={{ headerShown: false }} component={SignIn}/>
      <Stack.Screen name="SignUp" options={{ headerShown: false }} component={SignUp}/>
      <Stack.Screen name="SelectAvatar" options={{ headerShown: false }} component={SelectAvatar}/>
    </Stack.Navigator>
  );
}