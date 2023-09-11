import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore module
import auth from '@react-native-firebase/auth';
import {Swipeable, TouchableOpacity} from 'react-native-gesture-handler';

type RootStackParamList = {
  Home: undefined;
  TaskList: undefined;
  TaskIn: {
    taskId: string;
    taskText: string;
  };
};

interface Project {
  id: string;
  text: string;
  completed: boolean;
}

const TaskList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState('');

  // Fetch Projects from Firestore
  const fetchProjects = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const projectsSnapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('projects')
        .orderBy('createdAt', 'desc') // Order by creation time in descending order
        .get();

      const projectsData = projectsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setProjects(projectsData as Project[]);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchProjects(); // Fetch Projects when the screen comes into focus
    });
    return unsubscribe;
  }, [navigation]);

  const addProject = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        if (newProject.trim() !== '') {
          await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('projects')
            .add({
              text: newProject,
              completed: false,
              createdAt: firestore.FieldValue.serverTimestamp(), // Set createdAt field
            });
          fetchProjects(); // Fetch the updated Projects for the user
          setNewProject('');
        }
      } catch (error) {
        console.error('Error adding project:', error);
      }
    }
  };

  const toggleCompleted = async (projectId: string, completed: boolean) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('projects')
          .doc(projectId)
          .update({
            completed: completed,
          });
        fetchProjects(); // Fetch the updated Projects for the user
      }
    } catch (error) {
      console.error('Error updating Project:', error);
    }
  };

  const navigateToProjIn = (projectId: string, projectText: string) => {
    navigation.navigate('ProjIn', {
      projectId: projectId,
      projectText: projectText,
    });
    console.log(projectId, projectText);
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Show a confirmation popup before deleting the project
      Alert.alert(
        'Think slow, decide fast',
        'Are you really-really pretty-pretty sure you want to delete this project?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: async () => {
              const currentUser = auth().currentUser;
              if (currentUser) {
                await firestore()
                  .collection('users')
                  .doc(currentUser.uid)
                  .collection('projects')
                  .doc(projectId)
                  .delete();
                fetchProjects(); // Fetch the updated Projects for the user
              }
            },
            style: 'destructive',
          },
        ],
        {cancelable: true},
      );
    } catch (error) {
      console.error('Error deleting Project:', error);
    }
  };

  const renderSwipeableRow = (project: Project) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100%',
          padding: 10,
        }}
        onPress={() => deleteProject(project.id)}>
        <Text style={{color: 'white'}}>Delete</Text>
      </TouchableOpacity>
    );

    const renderLeftActions = () => (
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'flex-end',
          height: '100%',
          padding: 10,
        }}
        onPress={() => deleteProject(project.id)}>
        <Text style={{color: 'white'}}>Delete</Text>
      </TouchableOpacity>
    );

    return (
      <TouchableOpacity
        onPress={() => navigateToProjIn(project.id, project.text)}>
        <Swipeable
          renderRightActions={renderRightActions}
          renderLeftActions={renderLeftActions}
          overshootRight={false}
          overshootLeft={false}>
          <View
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              alignItems: 'center',
              paddingTop: 10,
              padding: 10,
              borderBottomWidth: 1,
              borderBlockColor: 'lightgray',
            }}>
            <TouchableOpacity
              onPress={() => toggleCompleted(project.id, !project.completed)}>
              <Text
                style={{
                  color: project.completed ? 'green' : 'gray',
                }}>
                {project.completed ? '☑' : '☐'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={{
                flex: 1,
                paddingLeft: 10,
              }}
              onPress={() => navigateToProjIn(project.id, project.text)}>
              <Text
                style={{
                  color: project.completed ? 'lightgray' : 'black',
                  textDecorationLine: project.completed
                    ? 'line-through'
                    : 'none',
                  paddingRight: 10,
                  fontWeight: 'bold',
                }}>
                {project.text}
              </Text>
            </TouchableOpacity>
          </View>
        </Swipeable>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <ScrollView>
        {projects.map(project => (
          <View key={project.id}>{renderSwipeableRow(project)}</View>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          marginTop: 10,
        }}>
        <TextInput
          style={{
            flex: 1,
          }}
          placeholder="Add a project"
          placeholderTextColor="gray"
          value={newProject}
          onChangeText={setNewProject}
          onSubmitEditing={addProject}
        />
      </View>
    </View>
  );
};

export default TaskList;
