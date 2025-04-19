import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, Platform } from 'react-native';
import { auth } from '../../firebase/firebaseConfig'; // Import the auth
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useRouter } from "expo-router";
import { LinearGradient } from 'expo-linear-gradient';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95, // Slightly scale down
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1, // Reset to original size
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleSignIn = async () => {
    // Check if email or password fields are empty
    if (!email || !password) {
      Alert.alert('Input Error', 'Please enter both email and password.');
      return; // Prevent further execution if fields are empty
    }

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('User signed in: ', userCredential.user);
      router.push("/(screens)/ClassroomScreen");
    } catch (error) {
      console.error('Error signing in: ', error);
      Alert.alert('Sign-In Error', error.message);
    }
  };

  const handleSignUpNavigation = () => {
    router.push("/(auth)/SignUp"); // Redirects to the Sign Up screen
  };

  return (
    <LinearGradient
      colors={['#f0f4f7', '#dfe7ed', '#c7d0d8']}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign In</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
        />
        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            onPress={handleSignIn}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Sign In</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Sign up text */}
        <View style={styles.signUpContainer}>
          <Text style={styles.signUpText}>Don't have an account? </Text>
          <TouchableOpacity onPress={handleSignUpNavigation}>
            <Text style={styles.signUpLink}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 30,
    textAlign: 'center',
    color: '#333',
    fontWeight: '600',
  },
  input: {
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    paddingHorizontal: 15,
    color: '#333',
    fontSize: 16,
  },
  button: {
    backgroundColor: '#ff5a5f',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    ...(Platform.OS === 'android'
      ? { elevation: 5 } // Android shadow using elevation
      : { 
          shadowColor: '#000', 
          shadowOffset: { width: 0, height: 2 }, 
          shadowOpacity: 0.8, 
          shadowRadius: 2 
        }),
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signUpText: {
    color: '#333',
    fontSize: 16,
  },
  signUpLink: {
    color: '#007BFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
