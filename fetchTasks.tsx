import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Task from './TaskList';

export const fetchTasks = async (
  parentTaskId: string,
  setTasks: (tasks: (typeof Task)[]) => void,
) => {
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
        const taskData = doc.data() as typeof Task;
        return {
          ...taskData,
          id: doc.id,
        };
      });

      setTasks(tasksData); // Update the state with the fetched tasks
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  } else {
    console.error('User not authenticated.');
  }
};
