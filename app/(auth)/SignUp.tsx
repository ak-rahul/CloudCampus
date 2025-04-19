import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Animated,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from '../../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons';

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const scaleValue = useRef(new Animated.Value(1)).current;
  const shadowValue = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
      friction: 4,
      tension: 100,
      useNativeDriver: false, // JS-driven animation for scale
    }).start();

    Animated.timing(shadowValue, {
      toValue: 10, // Elevation for 3D effect
      duration: 200,
      useNativeDriver: false, // JS-driven for shadow effect
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 100,
      useNativeDriver: false, // JS-driven for scale
    }).start();

    Animated.timing(shadowValue, {
      toValue: 0, // Reset elevation
      duration: 200,
      useNativeDriver: false, // JS-driven for shadow effect
    }).start();
  };

  const handleSignUp = async () => {
    if (password !== confirmPassword) return Alert.alert('Error', 'Passwords do not match!');
    if (!name.trim()) return Alert.alert('Error', 'Name is required!');
    if (!email.includes('@')) return Alert.alert('Error', 'Please enter a valid email!');
    
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userData = {
        name,
        email,
        avatar: "",
        role,
        classrooms: role === "teacher" ? [] : null,
        joinedClassrooms: role === "student" ? [] : null,
      };
      await setDoc(doc(db, "user-info", user.uid), userData);
      router.push({ pathname: "/(auth)/SelectAvatar", params: { uid: user.uid } });
    } catch (error) {
      Alert.alert('Sign-Up Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleButton = (value, label, iconName) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setRole(value)}
      style={[styles.roleButton, role === value && styles.roleButtonSelected]}
    >
      <LinearGradient
        colors={role === value ? ['#007BFF', '#0056b3'] : ['#e0e0e0', '#cfcfcf']}
        style={styles.gradientButton}
      >
        <Ionicons
          name={iconName}
          size={26}
          color={role === value ? '#fff' : '#555'}
          style={styles.icon}
        />
        <Text style={[styles.roleText, role === value && styles.roleTextSelected]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#dfe9f3', '#fff']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.formContainer}>
          <Text style={styles.title}>Create Account</Text>
          <Text style={styles.subtitle}>Let's get you started!</Text>

          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={name}
            onChangeText={setName}
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm Password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            placeholderTextColor="#888"
          />

          <View style={styles.radioGroup}>
            {renderRoleButton('student', 'Student', 'school')}
            {renderRoleButton('teacher', 'Teacher', 'person')}
          </View>

          <Animated.View style={{ transform: [{ scale: scaleValue }], shadowOffset: { width: 0, height: shadowValue } }}>
            <TouchableOpacity
              onPress={handleSignUp}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.button}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Sign Up</Text>
              )}
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  formContainer: {
    padding: 25,
    paddingTop: 80,
    paddingBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    marginBottom: 5,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    marginBottom: 25,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#333',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  roleButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  roleButtonSelected: {
    elevation: 4,
  },
  gradientButton: {
    padding: 14,
    alignItems: 'center',
    borderRadius: 12,
  },
  icon: {
    marginBottom: 5,
  },
  roleText: {
    fontSize: 15,
    color: '#555',
  },
  roleTextSelected: {
    color: '#fff',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 10,
    width: 200,
    alignItems: 'center',
    shadowColor: '#007BFF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: 'bold',
  },
});
