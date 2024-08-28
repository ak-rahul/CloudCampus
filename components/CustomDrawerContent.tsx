import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function CustomDrawerContent({ navigation }) {
  const [activeRoute, setActiveRoute] = useState(''); // State to track the active route

  const handlePress = (routeName) => {
    setActiveRoute(routeName);
    navigation.navigate(routeName);
  };

  return (
    <View style={styles.drawerContent}>
      <TouchableOpacity
        style={[
          styles.drawerButton,
          activeRoute === 'Scanner' && styles.activeButton, // Apply active style if active
        ]}
        onPress={() => handlePress('Scanner')}
      >
        <Text style={styles.buttonText}>Go to Scanner</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[
          styles.drawerButton,
          activeRoute === 'Classroom' && styles.activeButton, // Apply active style if active
        ]}
        onPress={() => handlePress('Classroom')}
      >
        <Text style={styles.buttonText}>Go to Classroom</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  drawerContent: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  drawerButton: {
    backgroundColor: '#007BFF',
    padding: 15,
    borderRadius: 20,
    marginVertical: 10,
  },
  activeButton: {
    backgroundColor: 'red', // Change this to your desired active color
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    textAlign: 'center',
  },
});
