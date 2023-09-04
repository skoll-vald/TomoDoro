import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, Text} from 'react-native';
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
  const {taskId, projectText} = route.params;
  const navigation = useNavigation();
  const [updatedText, setUpdatedText] = useState(projectText); // State to hold the updated text
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [deadline, setDeadline] = useState(null); // State to hold the deadline date and time
  const [description, setDescription] = useState('');

  // Fetch the deadline from Firestore when the component mounts
  useEffect(() => {
    const fetchDescription = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const doc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .doc(taskId)
            .get();
          const taskData = doc.data();
          if (taskData && taskData.description) {
            setDescription(taskData.description);
          }
        }
      } catch (error) {
        console.error('Error fetching description:', error);
      }
    };
    fetchDescription();
  }, [taskId]);

  useEffect(() => {
    const fetchDeadline = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const doc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('tasks')
            .doc(taskId) // Replace taskId with the actual task ID
            .get();
          const taskData = doc.data();
          if (taskData && taskData.deadline) {
            // Parse the string-based deadline from Firestore into a Date object
            const deadlineDate = new Date(taskData.deadline);
            setDeadline(deadlineDate);
          }
        }
      } catch (error) {
        console.error('Error fetching deadline:', error);
      }
    };

    fetchDeadline();
  }, [deadline, taskId]);

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
      }
    } catch (error) {
      console.error('Error updating task text:', error, taskId);
    }
  };

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const updateDlInFirestore = async date => {
    setDeadline(date); // Update the deadline state with the selected date
    hideDatePicker();
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId) // Replace taskId with the actual task ID
          .update({
            deadline: date.toISOString(), // Update the 'deadline' field in Firestore with ISO string
          });
      }
    } catch (error) {
      console.error('Error updating task deadline:', error);
    }
  };

  const updateDescriptionInFirestore = async () => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId)
          .update({
            description: description,
          });
      }
    } catch (error) {
      console.error('Error updating task description:', error);
    }
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text
        style={{
          color: 'gray',
          fontSize: 12,
        }}>
        project name
      </Text>
      <TextInput
        style={{
          color: 'black',
          fontWeight: 'bold',
          borderBottomWidth: 1,
          borderColor: 'lightgray',
          marginBottom: 20,
          fontSize: 20,
          padding: 5,
        }}
        value={updatedText}
        onChangeText={text => setUpdatedText(text)}
        onSubmitEditing={updateTextInFirestore}
      />
      <Text
        style={{
          color: 'gray',
          fontSize: 12,
          marginTop: 40,
        }}>
        deadline
      </Text>
      <Text
        style={{
          color: 'green',
          fontSize: 16,
        }}
        onPress={() => {
          showDatePicker();
        }}>
        {deadline
          ? `${new Date(deadline).toLocaleDateString()} ${new Date(
              deadline,
            ).toLocaleTimeString()}`
          : 'Add deadline'}
      </Text>
      <DateTimePickerModal
        isVisible={isDatePickerVisible}
        mode="datetime"
        onConfirm={updateDlInFirestore}
        onCancel={hideDatePicker}
      />
      <Text
        style={{
          color: 'gray',
          fontSize: 12,
          marginTop: 40,
        }}>
        description
      </Text>
      <TextInput
        style={{
          color: 'black',
          borderWidth: 1,
          borderColor: 'lightgray',
          marginBottom: 20,
          fontSize: 16,
          padding: 5,
        }}
        value={description}
        onChangeText={text => setDescription(text)}
        placeholder="Add description"
        multiline={true} // Enable multiline
        numberOfLines={4} // Adjust the number of lines as needed
        onBlur={updateDescriptionInFirestore} // Update description when focus is lost
      />
    </View>
  );
};

export default ProjIn;
