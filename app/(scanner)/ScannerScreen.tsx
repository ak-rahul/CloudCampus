import React, { useState } from 'react';
import { View, Image, Button, StyleSheet, Text, Alert } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import * as FileSystem from 'expo-file-system';
import RNHTMLtoPDF from 'react-native-html-to-pdf'; // PDF generation
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';
import { FLASK_SERVER_IP } from "../../constants/constants";

const ScannerScreen = () => {
  const [scannedImage, setScannedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Function to scan the document
  const scanDocument = async () => {
    try {
      const { scannedImages } = await DocumentScanner.scanDocument();

      if (scannedImages.length > 0) {
        setScannedImage(scannedImages[0]); // Show the first scanned image
      } else {
        alert('No image scanned.');
      }
    } catch (error) {
      console.error('Scan failed: ', error);
      alert('Scanning failed.');
    }
  };

  // Function to convert the scanned image into a PDF
  const createPdfFromImage = async (imageUri: string) => {
    const htmlContent = `
      <html>
        <body style="margin:0;padding:0;">
          <img src="${imageUri}" style="width:100%;" />
        </body>
      </html>
    `;

    const { filePath } = await RNHTMLtoPDF.convert({
      html: htmlContent,
      fileName: 'scanned_assignment',
      base64: false,
    });

    return filePath!;
  };

  // Function to send the PDF file to Flask server
  const sendPdfToFlask = async (pdfUri: string) => {
    try {
      const formData = new FormData();
      formData.append('file', {
        uri: pdfUri,
        name: 'assignment.pdf',
        type: 'application/pdf',
      } as any);

      const response = await fetch(`${FLASK_SERVER_IP}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');
      const resultText = await response.text();
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
      const txtFilename = `submission_${Date.now()}.txt`;
      const txtUri = FileSystem.documentDirectory + txtFilename;
      await FileSystem.writeAsStringAsync(txtUri, txtContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      const response = await fetch(txtUri);
      const blob = await response.blob();
      const storage = getStorage();
      const fileRef = ref(storage, `submissions/${txtFilename}`);
      await uploadBytes(fileRef, blob);

      const downloadURL = await getDownloadURL(fileRef);

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
      // Create PDF from scanned image
      const pdfUri = await createPdfFromImage(scannedImage);

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
