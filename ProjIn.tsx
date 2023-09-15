import React, {useEffect, useState} from 'react';
import {
  KeyboardAvoidingView,
  View,
  TextInput,
  Button,
  Text,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {LocalNotification} from './android/app/src/services/LocalPushController';
import {Picker} from '@react-native-picker/picker';
import scheduleNotification from './scheduleNotification';
import TaskList from './TaskList';

type ProjInScreenRouteProp = Readonly<{
  key: string;
  name: 'ProjIn';
  path?: string | undefined;
}> &
  Readonly<{
    params: Readonly<{
      projectText: string;
      projectId?: string; // Make projectId optional
    }>;
  }>;

interface ProjInScreenProps {
  route: ProjInScreenRouteProp;
}

const ProjIn: React.FC<ProjInScreenProps> = ({route}) => {
  const {projectId, projectText} = route.params;
  const [updatedText, setUpdatedText] = useState(projectText); // State to hold the updated text
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [notificationTime, setNotificationTime] = useState('1_hour');

  const handleNotificationTimeChange = (
    value: React.SetStateAction<string>,
  ) => {
    setNotificationTime(value);
  };

  const handleButtonPress = () => {
    LocalNotification();
  };

  useEffect(() => {
    const fetchProjectData = async () => {
      try {
        const currentUser = auth().currentUser;
        if (currentUser) {
          const doc = await firestore()
            .collection('users')
            .doc(currentUser.uid)
            .collection('projects')
            .doc(projectId)
            .get();
          const projectData = doc.data();
          if (projectData) {
            if (projectData.deadline) {
              const deadlineDate = new Date(projectData.deadline);
              setDeadline(deadlineDate);
            }
            if (projectData.description) {
              setDescription(projectData.description);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching project data:', error);
      }
    };
    fetchProjectData();
  });

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const updateFieldInFirestore = async (fieldName: string, value: any) => {
    try {
      const currentUser = auth().currentUser;
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('projects')
          .doc(projectId) // Replace projectId with the actual project ID
          .update({
            [fieldName]: value,
          });
      }
    } catch (error) {
      console.error(`Error updating project ${fieldName}:`, error);
    }
  };

  // Update text field
  const updateTextInFirestore = async (text: string) => {
    setUpdatedText(text);
    await updateFieldInFirestore('text', text);
    console.log(text); // Log the updated text
  };

  // Update deadline field
  const updateDlInFirestore = async (date: Date) => {
    scheduleNotification(date, notificationTime, projectText);
    setDeadline(date);
    await updateFieldInFirestore('deadline', date.toISOString());
    console.log(date);
  };

  // Update description field
  const updateDescriptionInFirestore = async (text: string) => {
    setDescription(text);
    await updateFieldInFirestore('description', text);
    console.log(projectText); // Log the updated text
  };

  return (
    <KeyboardAvoidingView style={{flex: 1, padding: 20}}>
      <View style={{flex: 1, justifyContent: 'flex-end'}}>
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
          onChangeText={text => {
            updateTextInFirestore(text);
          }}
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
          onChangeText={text => {
            updateDescriptionInFirestore(text);
          }}
          placeholder="Add description"
          multiline={true} // Enable multiline
          numberOfLines={4} // Adjust the number of lines as needed
        />
        <Button title={'Local Push Notification'} onPress={handleButtonPress} />
        <Picker
          selectedValue={notificationTime}
          onValueChange={itemValue => {
            setNotificationTime(itemValue);
            handleNotificationTimeChange(itemValue);
            scheduleNotification(deadline, itemValue, projectText);
          }}>
          <Picker.Item label="Don't remind" value="dont_remind" />
          <Picker.Item label="1 Hour Before" value="1_hour" />
          <Picker.Item label="2 Hours Before" value="2_hours" />
          <Picker.Item label="1 Day Before" value="1_day" />
          <Picker.Item label="2 Days Before" value="2_days" />
          <Picker.Item label="1 Week Before" value="1_week" />
        </Picker>
        <TaskList projectId={projectId} />
        <View style={{flex: 1}} />
      </View>
    </KeyboardAvoidingView>
  );
};

export default ProjIn;
