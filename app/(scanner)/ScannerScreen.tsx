import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image } from 'react-native';
import Camera from 'expo-camera'; // ✅ Corrected import
import { Ionicons } from '@expo/vector-icons';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, doc, setDoc, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

export default function ScannerScreen({ route, navigation }: any) {
  const cameraRef = useRef<any>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCameraReady, setIsCameraReady] = useState(false);

  const classroomId = route.params?.classroomId;
  const assignmentId = route.params?.assignmentId;

  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      const mediaStatus = await MediaLibrary.requestPermissionsAsync();
      setHasPermission(status === 'granted' && mediaStatus.status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    if (cameraRef.current && isCameraReady) {
      const photo = await cameraRef.current.takePictureAsync();
      setPhotos((prev) => [...prev, photo.uri]);
    }
  };

  const generatePDF = async () => {
    if (photos.length === 0) {
      Alert.alert('No photos taken!');
      return;
    }

    const htmlContent = photos
      .map((uri) => `<img src="${uri}" style="width: 100%; margin-bottom: 10px;" />`)
      .join('');

    const { uri } = await Print.printToFileAsync({ html: `<div>${htmlContent}</div>` });

    await uploadToFirebase(uri);
  };

  const uploadToFirebase = async (pdfUri: string) => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      const filename = `scanned_${Date.now()}.pdf`;

      const response = await fetch(pdfUri);
      const blob = await response.blob();

      const storage = getStorage();
      const storageRef = ref(
        storage,
        `submissions/${classroomId}/${assignmentId}/${user?.uid}_${filename}`
      );

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const db = getFirestore();
      await setDoc(
        doc(db, 'classrooms', classroomId, 'assignments', assignmentId, 'submissions', user?.uid!),
        {
          submittedAt: Timestamp.now(),
          downloadURL,
          fileName: filename,
          submittedBy: user?.email,
        }
      );

      Alert.alert('Success', 'PDF uploaded successfully!');
      navigation.goBack();
    } catch (err) {
      console.error('Upload failed:', err);
      Alert.alert('Error', 'Failed to upload PDF');
    }
  };

  if (hasPermission === null) return <View />;
  if (!hasPermission) return <Text>No access to camera</Text>;

  return (
    <View style={styles.container}>
      <Camera
        style={styles.camera}
        ref={cameraRef}
        onCameraReady={() => setIsCameraReady(true)}
      />

      <ScrollView horizontal style={styles.previewContainer}>
        {photos.map((uri, index) => (
          <Image key={index} source={{ uri }} style={styles.preview} />
        ))}
      </ScrollView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.button} onPress={takePicture}>
          <Ionicons name="camera" size={28} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={generatePDF}>
          <Ionicons name="document-outline" size={28} color="#fff" />
          <Text style={styles.buttonText}>Submit PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 2 },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#222',
  },
  button: {
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#007bff',
    borderRadius: 8,
    flexDirection: 'row',
  },
  buttonText: { color: '#fff', marginLeft: 8 },
  previewContainer: {
    backgroundColor: '#000',
    padding: 10,
    height: 120,
  },
  preview: {
    width: 100,
    height: 100,
    marginRight: 10,
    borderRadius: 6,
  },
});
