import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import {fetchTasks} from './fetchTasks';
import Task from './TaskList';

export const addTask = async (
  newTaskText: string,
  taskId: any,
  parentTaskId: string,
  setTasks: React.Dispatch<React.SetStateAction<(typeof Task)[]>>, // Assuming Task[] is the type of your tasks state
  setNewTask: React.Dispatch<React.SetStateAction<string>>,
) => {
  const currentUser = auth().currentUser;
  if (currentUser) {
    try {
      if (newTaskText.trim() !== '') {
        const parentId = parentTaskId || 'topLevel';

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
        fetchTasks(parentTaskId, setTasks);

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
