import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import {fetchTasks} from './fetchTasks';
import {Task} from './Task';

export const deleteTask = async (
  taskId: string,
  parentTaskId: string,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
) => {
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
