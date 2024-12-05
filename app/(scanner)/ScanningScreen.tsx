import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Alert } from 'react-native';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import RNFS from 'react-native-fs';
import { PDFDocument, rgb } from 'pdf-lib';

export default function ScanningScreen() {
  const [scannedImages, setScannedImages] = useState([]);
  const [pdfPath, setPdfPath] = useState(null);

  const handleCaptureImage = async (source) => {
    try {
      const options = { mediaType: 'photo', quality: 0.8 };
      const result = source === 'camera' 
        ? await launchCamera(options)
        : await launchImageLibrary(options);

      if (result.assets && result.assets.length > 0) {
        setScannedImages((prevImages) => [
          ...prevImages,
          result.assets[0].uri,
        ]);
      }
    } catch (error) {
      console.error('Image capture failed:', error);
      Alert.alert('Error', 'Image capture failed.');
    }
  };

  const handleSavePDF = async () => {
    if (scannedImages.length === 0) {
      Alert.alert('No images', 'Please capture or select images first.');
      return;
    }

    try {
      const pdfDoc = await PDFDocument.create();

      for (const uri of scannedImages) {
        const jpgImageBytes = await RNFS.readFile(uri, 'base64');
        const jpgImage = await pdfDoc.embedJpg(`data:image/jpeg;base64,${jpgImageBytes}`);
        const page = pdfDoc.addPage([jpgImage.width, jpgImage.height]);
        page.drawImage(jpgImage, {
          x: 0,
          y: 0,
          width: jpgImage.width,
          height: jpgImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const pdfFilePath = `${RNFS.DocumentDirectoryPath}/scannedDocument.pdf`;
      await RNFS.writeFile(pdfFilePath, pdfBytes, 'base64');
      setPdfPath(pdfFilePath);

      Alert.alert('Success', 'Images saved as PDF!');
    } catch (error) {
      console.error('Error saving PDF:', error);
      Alert.alert('Error', 'Could not save PDF.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.instructions}>Capture or select images to create a PDF</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleCaptureImage('camera')}>
        <Text style={styles.buttonText}>Capture Image</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.button}
        onPress={() => handleCaptureImage('library')}>
        <Text style={styles.buttonText}>Select from Gallery</Text>
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
        <Text style={styles.pdfInfo}>PDF saved at: {pdfPath}</Text>
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
  button: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#28a745',
    marginVertical: 10,
  },
  buttonText: {
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
  pdfInfo: {
    marginTop: 20,
    fontSize: 16,
    color: 'green',
  },
});
