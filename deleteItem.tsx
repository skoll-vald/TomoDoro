import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
export enum ItemType {
  Project = 'projects',
  Task = 'tasks',
  Subtask = 'subtasks',
}

export const deleteItem = async (itemId: string, itemType: ItemType) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      await firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection(itemType)
        .doc(itemId)
        .delete();
    }
  } catch (error) {
    console.error(`Error deleting ${itemType}:`, error);
  }
};
