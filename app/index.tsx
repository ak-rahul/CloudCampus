import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { useRouter } from 'expo-router';

export default function Index() {
  const [scale] = useState(new Animated.Value(1)); 
  const router = useRouter();

  // Handle button press animation
  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  // Navigate to SignIn screen
  const handleSignIn = () => {
    console.log('Navigating to SignIn screen');
    router.push("/(auth)/SignIn"); // Directly navigate to the SignIn screen
  };

  return (
    <View style={styles.container}>
      <View style={styles.background} />
      <Image source={require('../assets/logo.png')} style={styles.logo} />
      <Animated.View style={[styles.signInButton, { transform: [{ scale }] }]}>
        <TouchableOpacity
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          onPress={handleSignIn}
          style={styles.buttonContent}
        >
          <Image source={require('../assets/google-logo.png')} style={styles.googleLogo} />
          <Text style={styles.signInText}>Sign in with Google</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  background: {
    ...StyleSheet.absoluteFillObject,
  },
  logo: {
    width: 350,
    height: 350,
    marginBottom: 20,
    marginTop: -40,
  },
  signInButton: {
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#dddddd',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  googleLogo: {
    width: 30,
    height: 30,
    marginRight: 15,
  },
  signInText: {
    color: '#000000',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
