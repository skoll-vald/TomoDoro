import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';

export enum ItemType {
  Project = 'projects',
  Task = 'tasks',
  Subtask = 'subtasks',
}

// Define a reusable function to delete an item by ID and type
export const deleteTask = async (taskId: string) => {
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
