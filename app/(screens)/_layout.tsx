import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';
import ScannerScreen from '../(screens)/ScannerScreen'
import ClassroomScreen from './ClassroomScreen';
import AvatarOptions from './AvatarOptions';
import CustomDrawerContent from '../../components/CustomDrawerContent';

const Drawer = createDrawerNavigator();
const RootStack = createStackNavigator();

function DrawerNavigator() {
  return (
    <Drawer.Navigator
      initialRouteName="Classroom"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
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

export default function App() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen name="DrawerNavigator" component={DrawerNavigator} />
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen name="AvatarOptions" component={AvatarOptions} />
      </RootStack.Group>
    </RootStack.Navigator>
  );
}