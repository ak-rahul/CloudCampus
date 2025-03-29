import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from './ScannerScreen';


const Stack = createStackNavigator();

export default function Scannerlayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ScannerScreen" component={ScannerScreen} />
    </Stack.Navigator>
  );
}
