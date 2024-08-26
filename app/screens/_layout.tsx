// components/DrawerNavigator.tsx
import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import ScannerScreen from './ScannerScreen';
import ClassroomScreen from './ClassroomScreen';
import { NavigationContainer } from '@react-navigation/native';
import { View, StyleSheet } from 'react-native';

const Drawer = createDrawerNavigator();

export default function DrawerNavigator() {
    return (
            <Drawer.Navigator
                initialRouteName="Classroom"
                screenOptions={{
                    headerShown: false,
                    drawerType: 'front',
                    drawerStyle: {
                        borderTopRightRadius: 40,
                        borderBottomRightRadius: 40,
                        overflow: 'hidden',
                        alignSelf: 'center',
                    },
                    drawerContentContainerStyle: {
                        flex: 1,
                        height: '100%',
                    },
                }}
            >
                <Drawer.Screen name="Scanner" component={ScannerScreen} />
                <Drawer.Screen name="Classroom" component={ClassroomScreen} />
            </Drawer.Navigator>
    );
}
