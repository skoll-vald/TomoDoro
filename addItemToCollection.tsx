import firestore from '@react-native-firebase/firestore';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';

export enum CollectionType {
  Projects = 'projects',
  Tasks = 'tasks',
  Subtasks = 'subtasks',
  // Add other collection types as needed
}

export interface ItemData {
  text: string;
  completed: boolean;
}

export const addItemToCollection = async (
  collectionType: CollectionType,
  itemData: ItemData,
  parentId: string | null,
) => {
  try {
    const currentUser = auth().currentUser; // Move this line here to ensure currentUser is defined

    let collectionRef;

    if (parentId) {
      // If parentId is provided, we assume it's a subcollection
      collectionRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
        .collection(CollectionType.Projects) // Remove this line
        .doc(parentId)
        .collection(collectionType);
    } else {
      // Otherwise, it's a top-level collection
      collectionRef = firestore()
        .collection('users')
        .doc(currentUser.uid)
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
