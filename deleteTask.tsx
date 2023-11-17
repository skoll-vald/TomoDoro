import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {Alert} from 'react-native';
import {fetchTasks} from './fetchTasks';
import {Task} from './Task';

const deleteTaskRecursive = async (
  taskId: string,
  parentTaskId: string,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      // Fetch the task and its children
      const taskSnapshot = await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection('tasks')
        .doc(taskId)
        .get();

      const task = taskSnapshot.data() as Task;

      if (task) {
        // Recursively delete children
        const deleteChildTasks = async (parentId: string) => {
          const childrenSnapshot = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .where('parentId', '==', parentId)
            .get();

          const childTasks = childrenSnapshot.docs.map(doc => doc.id);
          const deletePromises = childTasks.map(childTaskId =>
            deleteTaskRecursive(childTaskId, parentTaskId, setTasks),
          );

          await Promise.all(deletePromises);
        };

        await deleteChildTasks(taskId);

        // Delete the current task
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId)
          .delete();

        // Fetch the updated tasks
        fetchTasks(parentTaskId, setTasks);
      }
    }
  } catch (error) {
    console.error('Error deleting Task:', error);
  }
};

export const deleteTask = async (
  taskId: string,
  parentTaskId: string,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
) => {
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
          await deleteTaskRecursive(taskId, parentTaskId, setTasks);
        },
        style: 'destructive',
      },
    ],
    {cancelable: true},
  );
};
