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

interface Task {
  id: string;
  text: string;
  completed: boolean;
  parentId?: string;
}

const TaskList: React.FC<{parentTaskId?: string; taskId?: string}> = ({
  parentTaskId,
  taskId,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const topLevelTasks = tasks.filter(task => !task.parentId);
  const childTasks = tasks.filter(task => task.parentId === parentTaskId);

  // Fetch Tasks from Firestore
  const fetchTasks = async (parentTaskId: undefined | string) => {
    // Fetch all tasks initially
    const currentUser = auth().currentUser;
    if (currentUser) {
      const tasksSnapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('tasks')
        .orderBy('createdAt', 'desc')
        .get();

      const tasksData = tasksSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Filter and set only the child tasks of the currently viewed task
      const childTasks = tasksData.filter(
        task => task.parentId === parentTaskId,
      );
      setTasks(childTasks);
    }
  };

  useEffect(() => {
    fetchTasks(undefined); // Fetch top-level tasks
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(parentTaskId); // Fetch Tasks when the screen comes into focus
    });
    return unsubscribe;
  }, [navigation, parentTaskId]);

  const addTask = async (
    newTaskText: string,
    taskId: string,
    parentId: string,
  ) => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        if (newTask.trim() !== '') {
          const newTaskData = {
            text: newTask,
            completed: false,
            createdAt: firestore.FieldValue.serverTimestamp(),
            parentId: parentId, // Set the parent ID
          };

          await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .add(newTaskData);

          fetchTasks(taskId);
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
        console.log(`Toggling completion for task ${taskId} to ${completed}`);
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId)
          .update({
            completed: completed,
          });
        console.log(`Task ${taskId} completion updated successfully.`);
        fetchTasks(parentTaskId); // Fetch the updated Tasks for the user
      }
    } catch (error) {
      console.error(`Error updating Task ${taskId}:`, error);
    }
  };

  const navigateToTaskIn = (
    taskId: string,
    taskText: string,
    parentTaskId: string,
  ) => {
    navigation.navigate('TaskIn', {
      taskId: taskId,
      taskText: taskText,
      parentTaskId: taskId, // Pass the parentTaskId as well
    });
    console.log(taskId, taskText, parentTaskId);
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
                fetchTasks(parentTaskId); // Fetch the updated Tasks for the user
              }
            },
            style: 'destructive',
          },
        ],
        {cancelable: true},
      );
    } catch (error) {
      console.error('Error deleting Task:', error);
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
      <TouchableOpacity onPress={() => navigateToTaskIn(task.id, task.text)}>
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
              onPress={() => navigateToTaskIn(task.id, task.text)}>
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
      </TouchableOpacity>
    );
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <ScrollView>
        {childTasks.map(task => (
          <View key={task.id}>{renderSwipeableRow(task)}</View>
        ))}
      </ScrollView>
      <View
        style={{
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
          onSubmitEditing={() => addTask(newTask, taskId, parentTaskId)}
        />
      </View>
    </View>
  );
};

export default TaskList;
