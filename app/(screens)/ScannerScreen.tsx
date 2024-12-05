// ScannerScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Animated, Alert } from 'react-native';
import { useRouter } from "expo-router";  // Use the useRouter hook for navigation
import { getFirestore, getDoc, doc } from 'firebase/firestore';
import { auth } from '../../firebase/firebaseConfig';

export default function ScannerScreen() {
  const router = useRouter();
  const [selectedOption, setSelectedOption] = useState('Recent');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const animatedValue = useRef(new Animated.Value(0)).current;
  const db = getFirestore();

  useEffect(() => {
    const fetchUserAvatar = async () => {
      const user = auth.currentUser;
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'user-info', user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setAvatarUrl(userData.avatar);
          }
        } catch (error) {
          console.error('Error fetching user avatar: ', error);
          Alert.alert('Error', 'Could not fetch user avatar.');
        }
      }
    };
    fetchUserAvatar();
  }, []);

  const toggleOption = (option) => {
    setSelectedOption(option);
    Animated.timing(animatedValue, {
      toValue: option === 'Recent' ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 130],
  });

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Doc-Scanner</Text>
        <TouchableOpacity
          style={styles.avatarTouchableArea}
          onPress={() => router.push('/screens/AvatarOptions')}  // Update navigation for AvatarOptions
        >
          {avatarUrl && (
            <Image style={styles.avatar} source={{ uri: avatarUrl }} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.toggleContainer}>
        <Animated.View style={[styles.animatedBackground, { transform: [{ translateX }] }]} />

        <TouchableOpacity style={styles.toggleButton} onPress={() => toggleOption('Recent')}>
          <Text style={selectedOption === 'Recent' ? styles.activeText : styles.inactiveText}>Recent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.toggleButton} onPress={() => toggleOption('All')}>
          <Text style={selectedOption === 'All' ? styles.activeText : styles.inactiveText}>All</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.scanButton}
        onPress={() => router.push('/scanner')}  // Navigate to ScanningScreen
      >
        <Text style={styles.scanButtonText}>Scan</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles (remain the same as in your provided code)


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
    width: 47,
    height: 47,
    borderRadius: 20,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: '#E0E0E0',
    borderRadius: 25,
    padding: 4,
    width: 260,
    position: 'relative',
    alignSelf: 'center',
    marginTop: 20,
  },
  toggleButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  animatedBackground: {
    position: 'absolute',
    width: 130,
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
    bottom: 50,
    left: '57%',
    marginLeft: -65,
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
