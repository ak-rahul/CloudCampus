// components/DrawerHandle.tsx
import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer'; // Import the DrawerNavigationProp type

type DrawerNavigation = DrawerNavigationProp<any>; // Adjust the type according to your navigation structure

export default function DrawerHandle() {
    const navigation = useNavigation<DrawerNavigation>(); // Use the correct type

    return (
        <TouchableOpacity 
            style={styles.handle}
            onPress={() => navigation.openDrawer()} // Now `openDrawer` will be recognized
        >
            <View style={styles.handleBar} />
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    handle: {
        position: 'absolute',
        top: '50%',
        left: 0,
        zIndex: 1000,
        padding: 5,
        backgroundColor: '#ccc',
        borderTopRightRadius: 10,
        borderBottomRightRadius: 10,
    },
    handleBar: {
        width: 30,
        height: 5,
        backgroundColor: '#333',
        borderRadius: 2.5,
    },
});
