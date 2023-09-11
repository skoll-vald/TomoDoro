import React, {useEffect, useState} from 'react';
import {View, TextInput, ScrollView} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore module
import auth from '@react-native-firebase/auth';
import ListItem from './ListItem'; // Import the ListItem component
import {toggleCompletionStatus, ItemType} from './toggleCompletionStatus';
import {deleteItem} from './deleteItem';
import {showConfirmationAlert} from './AlertService';
import {addItemToCollection, CollectionType} from './addItemToCollection';

type RootStackParamList = {
  Home: undefined;
  ProjList: undefined;
  ProjIn: {
    projectId: string;
    projectText: string;
  };
};

interface Project {
  id: string;
  text: string;
  completed: boolean;
}

const ProjList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [projects, setProjects] = useState<Project[]>([]);
  const [newProject, setNewProject] = useState('');
  const currentUser = auth().currentUser;

  // Fetch Projects from Firestore
  const fetchProjects = async () => {
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

  const toggleCompleted = async (projectId: string, completed: boolean) => {
    try {
      await toggleCompletionStatus(projectId, ItemType.Project, completed);
      fetchProjects(); // Fetch the updated projects for the user
    } catch (error) {
      console.error('Error toggling project completion:', error);
    }
  };

  const navigateToProjIn = (projectId: string, projectText: string) => {
    navigation.navigate('ProjIn', {
      projectId: projectId,
      projectText: projectText,
    });
    console.log(projectId, projectText);
  };

  const addProject = async () => {
    try {
      if (newProject.trim() !== '') {
        const newProjectData = {
          text: newProject,
          completed: false,
          // Add other properties as needed
        };
        await addItemToCollection(
          currentUser.uid,
          CollectionType.Projects,
          null,
          newProjectData,
        );
        fetchProjects(); // Fetch the updated Projects for the user
        setNewProject('');
      }
    } catch (error) {
      console.error('Error adding project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      // Show a confirmation popup before deleting the project
      const title = 'Delete Project';
      const message = 'Are you sure you want to delete this project?';

      // Show the confirmation alert
      showConfirmationAlert(title, message, async () => {
        await deleteItem(projectId, ItemType.Project);
        fetchProjects(); // Fetch the updated Projects for the user
      });
    } catch (error) {
      console.error('Error deleting Project:', error);
    }
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <ScrollView>
        {projects.map(project => (
          <ListItem
            key={project.id}
            text={project.text}
            completed={project.completed}
            onDelete={() => deleteProject(project.id)}
            onPress={() => navigateToProjIn(project.id, project.text)}
            onComplete={(completed: boolean) =>
              toggleCompleted(project.id, completed)
            }
          />
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
          onChangeText={text => {
            setNewProject(text);
          }}
          onSubmitEditing={addProject}
        />
      </View>
    </View>
  );
};

export default ProjList;
