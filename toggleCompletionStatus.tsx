import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export enum ItemType {
  Project = 'projects',
  Task = 'tasks',
  Subtask = 'subtasks',
}

export const toggleCompletionStatus = async (
  itemId: string,
  itemType: ItemType,
  completed: boolean,
  parentId?: string,
) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      let itemRef = null; // Initialize itemRef to null

      if (itemType === ItemType.Project) {
        itemRef = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection(itemType)
          .doc(itemId);
      } else if (itemType === ItemType.Task && parentId) {
        itemRef = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('projects')
          .doc(parentId)
          .collection(itemType)
          .doc(itemId);
      }

      if (itemRef) {
        // Check if itemRef is not null before proceeding
        await itemRef.update({
          completed: completed,
        });
      }
    }
  } catch (error) {
    console.error(`Error toggling ${itemType} completion:`, error, itemId);
  }
};
