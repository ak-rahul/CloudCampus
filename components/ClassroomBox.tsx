import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ClassroomBoxProps {
  heading: string;
  subtitle: string;
}

const ClassroomBox: React.FC<ClassroomBoxProps> = ({ heading, subtitle }) => {
  return (
    <View style={styles.box}>
      <Text style={styles.heading}>{heading}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#f0f0f0',
    height: 100,  
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
    margin: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
});

export default ClassroomBox;
