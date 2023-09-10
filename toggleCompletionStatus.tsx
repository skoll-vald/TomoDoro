import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export enum ItemType {
  Project = 'projects',
  Task = 'tasks',
  Subtask = 'subtasks',
}

// Define a reusable function to toggle completion status for any item
export const toggleCompletionStatus = async (
  itemId: string,
  itemType: ItemType,
  completed: boolean,
) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection(itemType)
        .doc(itemId)
        .update({
          completed: completed,
        });
    }
  } catch (error) {
    console.error(`Error toggling ${itemType} completion:`, error);
  }
};
