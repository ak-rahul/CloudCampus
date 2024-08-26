// components/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import HomeScreen from './HomeScreen';
import ClassroomScreen from './ClassroomScreen';
import { NavigationContainer } from '@react-navigation/native';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
        <Drawer.Navigator initialRouteName="Home">
            <Drawer.Screen name="Home" component={HomeScreen} options={{ headerShown: false }}/>
            <Drawer.Screen name="Classroom" component={ClassroomScreen} options={{ headerShown: false }}/>
        </Drawer.Navigator>
    );
}
