import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Use the correct hook
import ClassroomBox from '../../components/ClassroomBox';

export default function ClassroomScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.headerBox}>
        <Text style={styles.headingText}>Classrooms</Text>
        <TouchableOpacity onPress={() => navigation.navigate('AvatarOptions')}>
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerBox: {
    backgroundColor: '#f0f0f0',
    paddingTop: 55,
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
});
