import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Update fetchCollectionData to accept an optional parentId parameter
export const fetchCollectionData = async (
  collectionType: string,
  parentId?: string,
) => {
  try {
    const currentUser = auth().currentUser;
    if (currentUser) {
      let query;

      if (collectionType === 'projects') {
        // Fetch projects
        query = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection(collectionType)
          .orderBy('createdAt', 'desc');
      } else if (collectionType === 'tasks' && parentId) {
        // Fetch tasks for a specific project
        query = firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('projects')
          .doc(parentId)
          .collection(collectionType)
          .orderBy('createdAt', 'desc');
      }

      console.log(
        'Fetching data from Firestore:',
        collectionType === 'projects'
          ? `/users/${currentUser.uid}/projects`
          : `/users/${currentUser.uid}/projects/${parentId}/tasks`,
      );

      const querySnapshot = await query.get();

      const fetchedData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      console.log('Fetched data:', fetchedData);

      return fetchedData;
    }

    console.log('No authenticated user. Returning empty array.');
    return []; // Return an empty array if there's no authenticated user
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};
