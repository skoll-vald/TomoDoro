import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

export enum ItemType {
  Project = 'projects',
  Task = 'tasks',
  Subtask = 'subtasks',
}

// Define a reusable function to delete an item by ID and type
export const deleteItem = async (
  itemId: string,
  itemType: ItemType,
  parentId?: string,
) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      let itemRef;

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
      } else {
        console.error('Neither Project nor Task condition triggered.');
        return;
      }

      // Check if the item is a project and if it has associated tasks
      if (itemType === ItemType.Project && parentId) {
        const tasksSnapshot = await itemRef.collection(ItemType.Task).get();
        tasksSnapshot.forEach(async taskDoc => {
          await taskDoc.ref.delete();
        });
      }

      // Delete the item itself
      await itemRef.delete();
    }
  } catch (error) {
    console.error(`Error deleting ${itemType}:`, error);
  }
};
