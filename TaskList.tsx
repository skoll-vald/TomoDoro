import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore module
import auth from '@react-native-firebase/auth';
import {Swipeable, TouchableOpacity} from 'react-native-gesture-handler';
import PropTypes from 'prop-types';

type RootStackParamList = {
  Home: undefined;
  TaskList: undefined;
  TaskIn: {
    taskId: string;
    taskText: string;
    parentTaskId: string;
  };
};

interface Task {
  id: string;
  text: string;
  completed: boolean;
  parentId?: string;
  createdAt: {seconds: number; nanoseconds: number};
}

const TaskList: React.FC<{parentTaskId?: string; taskId?: string}> = ({
  parentTaskId,
  taskId,
}) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  TaskList.propTypes = {
    taskId: PropTypes.string,
    parentTaskId: PropTypes.string,
  };

  const fetchTasks = async parentTaskId => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        let query = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .orderBy('createdAt', 'desc');

        if (parentTaskId) {
          // If a parentTaskId is provided, filter by that parent ID
          query = query.where('parentId', '==', parentTaskId);
        } else {
          // If no parentTaskId is provided, filter by 'topLevel' parent ID
          query = query.where('parentId', '==', 'topLevel');
        }

        const tasksSnapshot = await query.get();

        const tasksData = tasksSnapshot.docs.map(doc => {
          const taskData = doc.data() as Task;
          return {
            ...taskData,
            id: doc.id,
          };
        });

        setTasks(tasksData);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    } else {
      console.error('User not authenticated.');
    }
  };

  useEffect(() => {
    fetchTasks(parentTaskId);
  }, [parentTaskId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(parentTaskId); // Fetch Tasks when the screen comes into focus
    });
    return unsubscribe;
  }, [navigation, parentTaskId]);

  const addTask = async (newTaskText, taskId, parentTaskId) => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      try {
        if (newTaskText.trim() !== '') {
          const parentId = parentTaskId || 'topLevel'; // Use 'topLevel' as the parentId for top-level tasks

          const newTaskData = {
            text: newTaskText,
            completed: false,
            createdAt: firestore.FieldValue.serverTimestamp(),
            parentId: parentId,
          };

          const docRef = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .add(newTaskData);

          console.log('New task added with ID: ', docRef.id);

          // Fetch and update the tasks
          fetchTasks(parentTaskId);

          // Clear the input field
          setNewTask('');
        }
      } catch (error) {
        console.error('Error adding task:', error);
      }
    } else {
      console.error('User not authenticated.');
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

  const {dispatch} = navigation;

  const navigateToTaskIn = (
    taskId: string,
    taskText: string,
    parentTaskId: string,
  ) => {
    dispatch(
      StackActions.push('TaskIn', {
        taskId: taskId,
        taskText: taskText,
        parentTaskId: parentTaskId,
      }),
    );
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
      <TouchableOpacity
        onPress={() => navigateToTaskIn(task.id, task.text, parentTaskId)}>
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
              onPress={() =>
                navigateToTaskIn(task.id, task.text, parentTaskId || '')
              }>
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
        {tasks.map(task => (
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
