import React, { useState } from 'react';
import { View, Image, Button, StyleSheet, Text, Alert } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import * as FileSystem from 'expo-file-system';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

const FLASK_SERVER_IP = 'http://172.24.80.162:5000'; // Flask server IP

const ScannerScreen = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to scan the document
  const scanDocument = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();

      if (scannedImages.length > 0) {
        setScannedImage(scannedImages[0]); // Show first scanned image
      } else {
        alert('No image scanned.');
      }
    } catch (error) {
      console.error('Scan failed: ', error);
      alert('Scanning failed.');
    }
  };

  // Function to convert image to PDF and upload it to Flask server
  const sendPdfToFlask = async (pdfUri: string) => {
    try {
      const pdfBase64 = await FileSystem.readAsStringAsync(pdfUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Send the PDF as base64 to Flask server
      const response = await fetch(`${FLASK_SERVER_IP}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          file: pdfBase64,
          filename: 'assignment.pdf',
        }),
      });

      if (!response.ok) throw new Error('Upload failed');

      const resultText = await response.text(); // Assuming the response is a plain text file
      return resultText;
    } catch (error) {
      console.error('Error uploading to Flask:', error);
      Alert.alert('Upload Error', 'Failed to upload to server.');
      return null;
    }
  };

  // Function to upload .txt file to Firebase Storage and Firestore
  const uploadTxtToFirebase = async (txtContent: string) => {
    try {
      // Save .txt file locally
      const txtFilename = `submission_${Date.now()}.txt`;
      const txtUri = FileSystem.documentDirectory + txtFilename;
      await FileSystem.writeAsStringAsync(txtUri, txtContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Upload to Firebase Storage
      const response = await fetch(txtUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileRef = ref(storage, `submissions/${txtFilename}`);
      await uploadBytes(fileRef, blob);

      // Get download URL from Firebase
      const downloadURL = await getDownloadURL(fileRef);

      // Store metadata in Firestore
      const db = getFirestore();
      await addDoc(collection(db, 'submissions'), {
        submittedAt: Timestamp.now(),
        fileUrl: downloadURL,
        fileName: txtFilename,
        fileType: 'text/plain',
      });

      Alert.alert('Success', 'Text file submitted successfully.');
    } catch (error) {
      console.error('Submission error:', error);
      Alert.alert('Error', 'Failed to submit the text file.');
    }
  };

  // Function to handle scan and upload process
  const handleUpload = async () => {
    if (!scannedImage) {
      alert('Please scan a document first.');
      return;
    }

    setLoading(true);
    try {
      // Create PDF from scanned image (use the scanned image to create a PDF here)
      const pdfUri = await createPdfFromImage(scannedImage); // Replace with actual PDF creation logic

      // Send the PDF to the Flask server and wait for the .txt response
      const resultText = await sendPdfToFlask(pdfUri);

      if (resultText) {
        // Upload the .txt file to Firebase if Flask server responded with text
        await uploadTxtToFirebase(resultText);
      } else {
        alert('No response from server.');
      }
    } catch (error) {
      console.error('Error in handling upload:', error);
      alert('Failed to upload document.');
    } finally {
      setLoading(false);
    }
  };

  // Dummy function to create a PDF (you should use real logic to create a PDF from the image)
  const createPdfFromImage = async (imageUri: string) => {
    // You would replace this with actual PDF creation logic
    const pdfUri = FileSystem.documentDirectory + 'dummy.pdf';
    await FileSystem.writeAsStringAsync(pdfUri, 'Dummy PDF content', {
      encoding: FileSystem.EncodingType.UTF8,
    });
    return pdfUri;
  };

  return (
    <View style={styles.container}>
      {scannedImage ? (
        <Image source={{ uri: scannedImage }} style={styles.image} resizeMode="contain" />
      ) : (
        <Text style={styles.placeholder}>No document scanned yet.</Text>
      )}
      <Button title="Scan Another Document" onPress={scanDocument} />
      <Button title="Upload to Flask Server" onPress={handleUpload} disabled={loading} />
      {loading && <Text>Uploading...</Text>}
    </View>
  );
};

export default ScannerScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    borderRadius: 10,
    borderColor: '#ccc',
    borderWidth: 1,
  },
  placeholder: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});
