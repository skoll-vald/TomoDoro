import firestore from '@react-native-firebase/firestore';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

export enum CollectionType {
  Projects = 'projects',
  Tasks = 'tasks',
  Subtasks = 'subtasks',
  // Add other collection types as needed
}

interface ItemData {
  id: string;
  text: string;
  completed: boolean;
  // Add other properties as needed
}

export const addItemToCollection = async (
  userId: FirebaseAuthTypes.User,
  collectionType: CollectionType,
  parentId: string | null,
  itemData: ItemData,
) => {
  try {
    let collectionRef;

    if (parentId) {
      // If parentId is provided, we assume it's a subcollection
      collectionRef = firestore()
        .collection('users')
        .doc(userId)
        .collection(collectionType)
        .doc(parentId)
        .collection(collectionType);
    } else {
      // Otherwise, it's a top-level collection
      collectionRef = firestore()
        .collection('users')
        .doc(userId)
        .collection(collectionType);
    }

    await collectionRef.add({
      ...itemData,
      createdAt: firestore.FieldValue.serverTimestamp(),
    });

    // Fetch the updated items for the user (e.g., tasks, subtasks)
    // Implement your fetch function or pass a callback here
  } catch (error) {
    console.error(`Error adding item to ${collectionType}:`, error);
  }
};
