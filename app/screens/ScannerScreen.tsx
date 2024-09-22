import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function ScannerScreen() {
  const navigation = useNavigation();
  const [selectedOption, setSelectedOption] = useState('Recent');
  const animatedValue = useRef(new Animated.Value(0)).current; // For smooth animation

  // Handle toggle
  const toggleOption = (option) => {
    setSelectedOption(option);

    // Animate between "Recent" (left) and "All" (right)
    Animated.timing(animatedValue, {
      toValue: option === 'Recent' ? 0 : 1,  // Toggle between 0 and 1
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  // Interpolate animation (0 for Recent, 1 for All)
  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],  // Move across the width of one toggle button (half of the toggleContainer width)
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Doc-Scanner</Text>
        <TouchableOpacity 
          style={styles.avatarTouchableArea} 
          onPress={() => navigation.navigate('AvatarOptions')}
        >
          <Image
            style={styles.avatar}
            source={require('../../assets/avatar.png')}
          />
        </TouchableOpacity>
      </View>

      {/* Combined Toggle Button */}
      <View style={styles.toggleContainer}>
        <Animated.View style={[styles.animatedBackground, { transform: [{ translateX }] }]} />

        {/* "Recent" button */}
        <TouchableOpacity style={styles.toggleButton} onPress={() => toggleOption('Recent')}>
          <Text style={selectedOption === 'Recent' ? styles.activeText : styles.inactiveText}>
            Recent
          </Text>
        </TouchableOpacity>

        {/* "All" button */}
        <TouchableOpacity style={styles.toggleButton} onPress={() => toggleOption('All')}>
          <Text style={selectedOption === 'All' ? styles.activeText : styles.inactiveText}>
            All
          </Text>
        </TouchableOpacity>
      </View>

      {/* Floating Scan Button */}
      <TouchableOpacity style={styles.scanButton} onPress={() => alert('Scan button pressed!')}>
        <Text style={styles.scanButtonText}>Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    backgroundColor: '#f0f0f0',
    paddingTop: 40,
    paddingLeft: 20,
    paddingBottom: 10,
    paddingRight: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headingText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  avatarTouchableArea: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 30,
    backgroundColor: 'transparent',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    padding: 4,
    width: 260,  // Adjust the width to fit both buttons (130 each)
    position: 'relative',
    alignSelf: 'center',  // Center horizontally
    marginTop: 20,        // Add margin to push it below the header
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center', // Vertically centers the content
    alignItems: 'center',
    paddingVertical: 12,      // Adjusted padding for better centering
  },
  animatedBackground: {
    position: 'absolute',
    width: 130,  // Adjust width to be half of the toggleContainer width (since there are 2 buttons)
    height: '100%',
    alignSelf: 'center',
    backgroundColor: '#007BFF',
    borderRadius: 25,
  },
  activeText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  inactiveText: {
    color: '#000',
  },
  scanButton: {
    position: 'absolute',
    bottom: 50, // Adjust this value to move the button higher or lower
    left: '57%', // Center horizontally
    marginLeft: -65, // Half of the button width (130 / 2) for centering
    backgroundColor: '#007BFF',
    borderRadius: 25,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
