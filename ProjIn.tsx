import React, {useEffect, useState} from 'react';
import {View, TextInput, Button} from 'react-native';
import {RouteProp, useNavigation} from '@react-navigation/native';
import {RootStackParamList} from './NavigationTypes';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

type ProjInScreenRouteProp = RouteProp<RootStackParamList, 'ProjIn'>;

interface ProjInScreenProps {
  route: ProjInScreenRouteProp;
}

const ProjIn: React.FC<ProjInScreenProps> = ({route}) => {
  const { taskId, projectText } = route.params;
  const navigation = useNavigation();
  const [updatedText, setUpdatedText] = useState(projectText); // State to hold the updated text

  const updateTextInFirestore = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId) // Replace taskId with the actual task ID
          .update({
            text: updatedText, // Update the text field in Firestore
          });

        // Navigate back to the previous screen
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error updating task text:', error, taskId);
    }
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <TextInput
        style={{
          borderBottomWidth: 1,
          marginBottom: 20,
          fontSize: 16,
          padding: 5,
        }}
        value={updatedText}
        onChangeText={text => setUpdatedText(text)} // Update the state with the new text
      />
      <Button title="Update Text" onPress={updateTextInFirestore} />
    </View>
  );
};

export default ProjIn;
