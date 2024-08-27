import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ClassroomBox from '../../components/ClassroomBox';

export default function ClassroomScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classrooms</Text>
        <TouchableOpacity 
          style={styles.avatarTouchableArea} 
          onPress={() => navigation.navigate('AvatarOptions')}
        >
          <Image
            style={styles.avatar}
            source={require('../../assets/avatar.png')}
          />
        </TouchableOpacity>
      </View>
      <View style={styles.boxContainer}>
        <ScrollView scrollEnabled>
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
          <ClassroomBox heading="Classroom" subtitle="Welcome to your classroom" />
        </ScrollView>
      </View>
      <TouchableOpacity style={styles.floatingButton} onPress={() => {/* Handle button press */}}>
        <Icon name="add" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

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
    width: 60, // Increased width for touchable area
    height: 60, // Increased height for touchable area
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 30, // Match the avatar border radius
    backgroundColor: 'transparent', // Ensure the background is transparent
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  boxContainer: {
    flex: 1,
    flexGrow: 1,
    flexDirection: 'column',
    paddingBottom: 20,
  },
  floatingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007BFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
});
