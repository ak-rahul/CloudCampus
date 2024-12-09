import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SelectAvatar from './SelectAvatar';

const Stack = createStackNavigator();

export default function App() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="SignIn" component={SignIn} />
            <Stack.Screen name="SignUp" component={SignUp} />
            <Stack.Screen name="SelectAvatar" component={SelectAvatar} />
        </Stack.Navigator>
    );
}
