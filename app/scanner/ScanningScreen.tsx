import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import DocumentScanner from 'react-native-document-scanner-plugin';
import RNFS from 'react-native-fs';
import Pdf from 'react-native-pdf';

export default function ScanningScreen() {
  const [scannedImages, setScannedImages] = useState<string[]>([]);
  const [pdfPath, setPdfPath] = useState<string | null>(null);

  const handleScan = async () => {
    try {
      const { scannedImages: newScannedImages } = await DocumentScanner.scanDocument({
        letUserAdjustCrop: true,
        maxNumDocuments: 10,
      });
      setScannedImages((prevImages) => [...prevImages, ...newScannedImages]);
    } catch (error) {
      console.error('Scanning failed:', error);
      Alert.alert('Error', 'Scanning failed.');
    }
  };

  const handleSavePDF = async () => {
    if (scannedImages.length === 0) {
      Alert.alert('No scans', 'Please scan documents first.');
      return;
    }

    try {
      const pdfFilePath = `${RNFS.DocumentDirectoryPath}/scannedDocument.pdf`;

      // Convert images to a PDF
      await RNFS.writeFile(pdfFilePath, scannedImages.join('\n'), 'base64');
      setPdfPath(pdfFilePath);
      Alert.alert('Success', 'Scanned pages saved as PDF!');
    } catch (error) {
      console.error('Error saving PDF:', error);
      Alert.alert('Error', 'Could not save PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Start scanning your documents</Text>

      <TouchableOpacity style={styles.scanButton} onPress={handleScan}>
        <Text style={styles.scanButtonText}>Start Scanning</Text>
      </TouchableOpacity>

      <ScrollView horizontal style={styles.previewContainer}>
        {scannedImages.map((imageUri, index) => (
          <Image key={index} source={{ uri: imageUri }} style={styles.previewImage} />
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.saveButton} onPress={handleSavePDF}>
        <Text style={styles.saveButtonText}>Save as PDF</Text>
      </TouchableOpacity>

      {pdfPath && (
        <Pdf
          source={{ uri: pdfPath }}
          style={styles.pdfPreview}
          onLoadComplete={(numberOfPages) => {
            console.log(`PDF loaded with ${numberOfPages} pages.`);
          }}
          onError={(error) => {
            console.log(error);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  instructions: {
    fontSize: 18,
    marginBottom: 20,
  },
  scanButton: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#28a745',
    marginVertical: 10,
  },
  scanButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  previewContainer: {
    marginTop: 20,
    flexDirection: 'row',
  },
  previewImage: {
    width: 100,
    height: 150,
    resizeMode: 'contain',
    marginHorizontal: 5,
  },
  saveButton: {
    marginTop: 30,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007BFF',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pdfPreview: {
    width: '100%',
    height: 400,
    marginTop: 20,
  },
});
