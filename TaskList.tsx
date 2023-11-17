import React, {useEffect, useState} from 'react';
import {View, Text, TextInput, ScrollView, Alert} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {NavigationProp} from '@react-navigation/native';
import {StackActions} from '@react-navigation/native';
import firestore from '@react-native-firebase/firestore'; // Import Firebase Firestore module
import auth from '@react-native-firebase/auth';
import {Swipeable, TouchableOpacity} from 'react-native-gesture-handler';
import PropTypes from 'prop-types';
import {fetchTasks} from './fetchTasks';
import {addTask} from './addTask';
import renderSwipeableRow from './renderSwipeableRow';
import {toggleCompleted} from './toggleCompleted';

type RootStackParamList = {
  Home: undefined;
  TaskList: undefined;
  TaskIn: {
    taskId: string;
    taskText: string;
    parentTaskId: string | undefined;
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
  const {dispatch} = navigation;
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const handleAddTask = async (newTaskText: string) => {
    await addTask(newTaskText, taskId, parentTaskId, setTasks, setNewTask);
  };

  TaskList.propTypes = {
    taskId: PropTypes.string,
    parentTaskId: PropTypes.string,
  };

  useEffect(() => {
    fetchTasks(parentTaskId, setTasks);
  }, [parentTaskId]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchTasks(parentTaskId, setTasks); // Fetch Tasks when the screen comes into focus
    });
    return unsubscribe;
  }, [navigation, parentTaskId]);

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
                fetchTasks(parentTaskId, setTasks); // Fetch the updated Tasks for the user
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
              onPress={() =>
                toggleCompleted(
                  task.id,
                  !task.completed,
                  parentTaskId,
                  setTasks,
                )
              }>
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
          onSubmitEditing={() => handleAddTask(newTask)}
        />
      </View>
    </View>
  );
};

export default TaskList;
