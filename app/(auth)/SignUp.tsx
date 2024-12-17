import React, { useState, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Animated, ActivityIndicator } from 'react-native';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, firestore } from '../../firebase/firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { Ionicons } from '@expo/vector-icons'; // For icons

export default function SignUp() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('student');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const scaleValue = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleValue, { toValue: 0.95, friction: 5, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, { toValue: 1, friction: 5, useNativeDriver: true }).start();
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

      const userData = {
        name,
        email,
        avatar: "",
        role,
        classrooms: role === "teacher" ? [] : null,
        joinedClassrooms: role === "student" ? [] : null,
      };

      await setDoc(doc(firestore, "user-info", user.uid), userData);

      router.push({ pathname: "/(auth)/SelectAvatar", params: { uid: user.uid } });
    } catch (error) {
      console.error('Error signing up: ', error);
      Alert.alert('Sign-Up Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const renderRoleButton = (value, label, iconName) => (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => setRole(value)}
      style={[
        styles.roleButton,
        role === value && styles.roleButtonSelected,
      ]}
    >
      <LinearGradient
        colors={role === value ? ['#007BFF', '#0056b3'] : ['#f2f2f2', '#d9d9d9']}
        style={styles.gradientButton}
      >
        <Ionicons
          name={iconName}
          size={24}
          color={role === value ? '#fff' : '#666'}
          style={styles.icon}
        />
        <Text style={[styles.roleText, role === value && styles.roleTextSelected]}>
          {label}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  return (
    <LinearGradient colors={['#f0f4f7', '#dfe7ed', '#c7d0d8']} style={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Sign Up</Text>
        <TextInput style={styles.input} placeholder="Full Name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />
        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
        <View style={styles.radioGroup}>
          {renderRoleButton('student', 'Student', 'school')}
          {renderRoleButton('teacher', 'Teacher', 'person')}
        </View>

        <Animated.View style={{ transform: [{ scale: scaleValue }] }}>
          <TouchableOpacity onPress={handleSignUp} onPressIn={handlePressIn} onPressOut={handlePressOut} style={styles.button}>
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
          </TouchableOpacity>
        </Animated.View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center' },
  formContainer: { paddingHorizontal: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: 'center', fontWeight: '600' },
  input: { borderWidth: 1, marginBottom: 15, borderColor: '#ccc', borderRadius: 8, padding: 10 },
  radioTitle: { fontSize: 16, textAlign: 'center', marginBottom: 10 },
  radioGroup: { flexDirection: 'row', justifyContent: 'center', gap: 20 },
  roleButton: { borderRadius: 10, overflow: 'hidden', width: 140, height: 80 },
  roleButtonSelected: { elevation: 5, shadowColor: '#007BFF' },
  gradientButton: { flex: 1, justifyContent: 'center', alignItems: 'center', borderRadius: 10 },
  icon: { marginBottom: 5 },
  roleText: { fontSize: 16, color: '#666' },
  roleTextSelected: { color: '#fff', fontWeight: '600' },
  button: { backgroundColor: '#007BFF', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 10 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
