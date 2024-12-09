import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ClassroomScreen from './ClassroomScreen';
import AvatarOptions from './AvatarOptions';

const RootStack = createStackNavigator();

export default function Layout() {
  return (
      <RootStack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <RootStack.Screen name="ClassroomScreen" component={ClassroomScreen} />
        <RootStack.Group screenOptions={{ presentation: 'modal' }}>
          <RootStack.Screen name="AvatarOptions" component={AvatarOptions} />
        </RootStack.Group>
      </RootStack.Navigator>
  );
}
