import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './NavigationTypes';
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore module
import auth from '@react-native-firebase/auth';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const ProjList: React.FC = () => {
  const navigation = useNavigation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Fetch tasks from Firestore
  const fetchTasks = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      const tasksSnapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('tasks')
        .orderBy('createdAt', 'desc') // Order by creation time in descending order
        .get();

      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      setTasks(tasksData as Task[]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        if (newTask.trim() !== '') {
          await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .add({
              text: newTask,
              completed: false,
              createdAt: firestore.FieldValue.serverTimestamp(), // Set createdAt field
            });
          fetchTasks(); // Fetch the updated tasks for the user
          setNewTask('');
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    }
  };

  const toggleCompleted = async (taskId: string, completed: boolean) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId)
          .update({
            completed: completed,
          });
        fetchTasks(); // Fetch the updated tasks for the user
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const navigateToProjIn = (projectText: string) => {
    navigation.navigate('ProjIn', {projectText});
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <ScrollView>
        {tasks.map((task, index) => (
          <View
            key={task.id}
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <TouchableOpacity
              onPress={() => toggleCompleted(task.id, !task.completed)}>
              <Text>{task.completed ? '☑' : '☐'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1}}>
              <Text
                style={{
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                }}
                onPress={() => navigateToProjIn(task.text)}>
                {task.text}
              </Text>
            </TouchableOpacity>
          </View>
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
          style={{flex: 1}}
          placeholder="Add a task"
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
        />
      </View>
    </View>
  );
};

export default ProjList;
