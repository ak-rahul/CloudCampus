import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from '../../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student'); // Default role is 'student'
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 5,
      useNativeDriver: true,
    }).start();
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match!');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Name is required!');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Save user data in Firestore with the selected role
      await setDoc(doc(firestore, "user-info", user.uid), {
        name: name,
        email: email,
        avatar: "",
        role: role,
      });

      router.push({
        pathname: "/(auth)/SelectAvatar",
        params: { uid: user.uid },
      });
    } catch (error) {
      console.error('Error signing up: ', error);
      Alert.alert('Sign-Up Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRadioButton = (value: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.radioButtonContainer,
        role === value && styles.radioButtonSelected,
      ]}
      onPress={() => setRole(value)}
      activeOpacity={0.8}
    >
      <Text style={[styles.radioText, role === value && styles.radioTextSelected]}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <LinearGradient
      colors={['#f0f4f7', '#dfe7ed', '#c7d0d8']}
      style={styles.container}
    >
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput
          style={styles.input}
          placeholder="Full Name"
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          placeholderTextColor="#aaa"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#aaa"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
          editable={!isLoading}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholderTextColor="#aaa"
          editable={!isLoading}
        />

        {/* Interactive Role Selection */}
        <Text style={styles.radioTitle}>Select Your Role</Text>
        <View style={styles.radioGroup}>
          {renderRadioButton('student', 'Student')}
          {renderRadioButton('teacher', 'Teacher')}
        </View>

        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity
            onPress={isLoading ? null : handleSignUp}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={[styles.button, isLoading && { backgroundColor: '#ccc' }]}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Sign Up</Text>
            )}
          </TouchableOpacity>
        </Animated.View>
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
  radioTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
    textAlign: 'center',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  radioButtonContainer: {
    flex: 1,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 25,
    paddingVertical: 10,
    marginHorizontal: 5,
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  radioButtonSelected: {
    borderColor: '#007BFF',
    backgroundColor: '#e6f7ff',
  },
  radioText: {
    fontSize: 16,
    color: '#666',
  },
  radioTextSelected: {
    color: '#007BFF',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#ff5a5f',
    paddingVertical: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default SignUp;
