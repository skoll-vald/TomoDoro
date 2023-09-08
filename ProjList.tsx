import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore module
import auth from '@react-native-firebase/auth';
import {Swipeable, TouchableOpacity} from 'react-native-gesture-handler';

type RootStackParamList = {
  Home: undefined;
  ProjList: undefined;
  ProjIn: {
    taskId: string;
    projectText: string;
  };
};

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

const ProjList: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
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

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(); // Fetch tasks when the screen comes into focus
    });
    return unsubscribe;
  }, [navigation]);

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

  const navigateToProjIn = (taskId: string, projectText: string) => {
    navigation.navigate('ProjIn', {
      taskId: taskId,
      projectText: projectText,
    });
    console.log(taskId, projectText);
  };

  const deleteTask = async (taskId: string) => {
    try {
      // Show a confirmation popup before deleting the task
      Alert.alert(
        'Think slow, decide fast',
        'Are you really-really pretty-pretty sure you want to delete this task?',
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
                  .collection('tasks')
                  .doc(taskId)
                  .delete();
                fetchTasks(); // Fetch the updated tasks for the user
              }
            },
            style: 'destructive',
          },
        ],
        {cancelable: true},
      );
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const renderSwipeableRow = (task: Task) => {
    const renderRightActions = () => (
      <TouchableOpacity
        style={{
          backgroundColor: 'red',
          justifyContent: 'center',
          alignItems: 'flex-start',
          height: '100%',
          padding: 10,
        }}
        onPress={() => deleteTask(task.id)}>
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
        onPress={() => deleteTask(task.id)}>
        <Text style={{color: 'white'}}>Delete</Text>
      </TouchableOpacity>
    );

    return (
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
            onPress={() => toggleCompleted(task.id, !task.completed)}>
            <Text
              style={{
                color: task.completed ? 'green' : 'gray',
              }}>
              {task.completed ? '☑' : '☐'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingLeft: 10,
            }}
            onPress={() => navigateToProjIn(task.id, task.text)}>
            <Text
              style={{
                color: task.completed ? 'lightgray' : 'black',
                textDecorationLine: task.completed ? 'line-through' : 'none',
                paddingRight: 10,
                fontWeight: 'bold',
              }}>
              {task.text}
            </Text>
          </TouchableOpacity>
        </View>
      </Swipeable>
    );
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <ScrollView>
        {tasks.map(task => (
          <View key={task.id}>{renderSwipeableRow(task)}</View>
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
          placeholder="Add a task"
          placeholderTextColor="gray"
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
        />
      </View>
    </View>
  );
};

export default ProjList;
