import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {fetchTasks} from './fetchTasks';
import {Task} from './Task';

export const toggleCompleted = async (
  taskId: string,
  completed: boolean,
  parentTaskId: string,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>, // Assuming Task is defined in the same scope
) => {
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
      fetchTasks(parentTaskId, setTasks); // Fetch the updated Tasks for the user
    }
  } catch (error) {
    console.error(`Error updating Task ${taskId}:`, error);
  }
};
