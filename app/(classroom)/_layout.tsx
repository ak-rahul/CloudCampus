// app/(classroom)/layout.tsx
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import CreateClassroom from './CreateClassroom';
import JoinClassroom from './JoinClassroom';
import Classroom from './Classroom';

const Stack = createStackNavigator();

export default function ClassroomLayout() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CreateClassroom" component={CreateClassroom} />
      <Stack.Screen name="JoinClassroom" component={JoinClassroom} />
      <Stack.Screen name="Classroom" component={Classroom} />
    </Stack.Navigator>
  );
}
