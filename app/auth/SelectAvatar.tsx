import React, { useState, useEffect, useRef, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Alert, ActivityIndicator, Animated } from 'react-native';
import { getStorage, ref, listAll, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';
import { auth } from '../../firebase/firebaseConfig';
import { useRouter } from "expo-router";

export default function SelectAvatar() {
  const [avatars, setAvatars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const router = useRouter();
  const database = getDatabase();

  // Create animated values for each avatar and the button
  const animatedScales = useMemo(() => avatars.map(() => new Animated.Value(1)), [avatars]);
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const fetchAvatars = async () => {
      try {
        const storage = getStorage();
        const avatarRef = ref(storage, 'avatars/');
        const result = await listAll(avatarRef);

        const avatarUrls = await Promise.all(
          result.items.map(item => getDownloadURL(item))
        );
        setAvatars(avatarUrls);
      } catch (error) {
        console.error('Error fetching avatars: ', error);
        Alert.alert('Error', 'Could not fetch avatars from storage.');
      } finally {
        setLoading(false);
      }
    };

    fetchAvatars();
  }, []);

  const handleAvatarSelect = (avatarUrl, index) => {
    // Trigger pop animation for the selected avatar
    Animated.sequence([
      Animated.timing(animatedScales[index], {
        toValue: 1.2, // Scale up
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(animatedScales[index], {
        toValue: 1, // Scale back down
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSelectedAvatar(avatarUrl); // Set selected avatar after animation
    });
  };

  const handleGetStarted = async () => {
    try {
      const user = auth.currentUser;
      if (user && selectedAvatar) {
        await set(dbRef(database, 'users/' + user.uid), {
          avatar: selectedAvatar,
          email: user.email,
        });

        Alert.alert('Success', 'Avatar selected successfully!');
        router.push('/auth');
      } else {
        Alert.alert('Error', 'No user is signed in or no avatar is selected.');
      }
    } catch (error) {
      console.error('Error selecting avatar: ', error);
      Alert.alert('Error', 'Failed to save avatar.');
    }
  };

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 1.1,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(handleGetStarted);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
        <Text style={styles.loadingText}>Loading avatars...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Avatar</Text>
      <FlatList
        data={avatars}
        keyExtractor={(item, index) => index.toString()}
        numColumns={3}
        renderItem={({ item, index }) => (
          <TouchableOpacity onPress={() => handleAvatarSelect(item, index)} style={styles.avatarContainer}>
            <Animated.Image 
              source={{ uri: item }} 
              style={[styles.avatar, selectedAvatar === item && styles.selectedAvatar, { transform: [{ scale: animatedScales[index] }] }]} 
            />
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
      {/* Only render the button if an avatar is selected */}
      {selectedAvatar && (
        <View style={styles.buttonContainer}>
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity onPress={animateButton} style={styles.getStartedButton}>
              <Text style={styles.buttonText}>Get Started</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'flex-start',
    paddingTop: 50,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
    color: '#333',
  },
  avatarContainer: {
    margin: 10,
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 0,
    borderColor: '#007BFF',
  },
  selectedAvatar: {
    borderWidth: 3,
    borderColor: '#007BFF',
  },
  listContainer: {
    justifyContent: 'center',
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    fontSize: 18,
    marginTop: 10,
    color: '#333',
  },
  buttonContainer: {
    marginTop: 40, // Adjust this value if necessary
    alignItems: 'center',
  },
  getStartedButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 5,
    elevation: 3, // Adds a shadow effect for Android
    shadowColor: '#000', // Shadow color for iOS
    shadowOffset: { width: 0, height: 2 }, // Shadow offset for iOS
    shadowOpacity: 0.2, // Shadow opacity for iOS
    shadowRadius: 2, // Shadow radius for iOS
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
});
