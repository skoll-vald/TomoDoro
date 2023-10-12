import React, {useEffect, useState} from 'react';
import {View, TextInput, Button, Text} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import {LocalNotification} from './android/app/src/services/LocalPushController';
import {Picker} from '@react-native-picker/picker';
import scheduleNotification from './scheduleNotification';
import TaskList from './TaskList';

type TaskInScreenRouteProp = Readonly<{
  key: string;
  name: 'TaskIn';
  path?: string | undefined;
}> &
  Readonly<{
    params: Readonly<{
      taskText: string;
      taskId?: string; // Make taskId optional
    }>;
  }>;

interface TaskInScreenProps {
  route: TaskInScreenRouteProp;
}

const TaskIn: React.FC<TaskInScreenProps> = ({route}) => {
  const {taskId, taskText} = route.params;
  const [updatedText, setUpdatedText] = useState(taskText); // State to hold the updated text
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [description, setDescription] = useState('');
  const [notificationTime, setNotificationTime] = useState('1_hour');
  const [updatedDescription, setUpdatedDescription] = useState(description); // State to hold the updated description

  const handleNotificationTimeChange = (
    value: React.SetStateAction<string>,
  ) => {
    setNotificationTime(value);
  };

  const handleButtonPress = () => {
    LocalNotification();
  };

  useEffect(() => {
    const fetchTaskData = async () => {
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
          if (taskData) {
            if (taskData.deadline) {
              const deadlineDate = new Date(taskData.deadline);
              setDeadline(deadlineDate);
            }
            if (taskData.description) {
              // First, set the description to the state variable.
              setDescription(taskData.description);
              // Then, update the updatedDescription state variable.
              setUpdatedDescription(taskData.description);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    fetchTaskData();
  }, [taskId]); // Make sure to add taskId to the dependency array

  const showDatePicker = () => {
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const updateFieldInFirestore = async (fieldName: string, value: any) => {
    try {
      const currentUser = auth().currentUser;
      if (!currentUser) {
        console.error('User not authenticated.');
        return; // Exit the function if the user is not authenticated
      }
      if (currentUser) {
        await firestore()
          .collection('users')
          .doc(currentUser.uid)
          .collection('tasks')
          .doc(taskId)
          .update({
            [fieldName]: value,
          });
        console.log(`Successfully updated ${fieldName} in Firestore.`);
      } else {
        console.error('User not authenticated.');
      }
    } catch (error) {
      console.error(`Error updating ${fieldName} in Firestore:`, error);
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
    scheduleNotification(date, notificationTime, taskText);
    setDeadline(date);
    await updateFieldInFirestore('deadline', date.toISOString());
    console.log(date);
  };

  // Update description field
  const updateDescriptionInFirestore = async (description: string) => {
    setUpdatedDescription(description);
    await updateFieldInFirestore('description', description);
    console.log(description); // Log the updated text
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <Text
        style={{
          color: 'gray',
          fontSize: 12,
        }}>
        task name
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
        value={updatedDescription}
        onChangeText={newDescription => {
          updateDescriptionInFirestore(newDescription); // This will wait for a pause before updating Firestore
        }}
        placeholder="Add description"
        multiline={true} // Enable multiline
        numberOfLines={4}
      />
      <Button title={'Local Push Notification'} onPress={handleButtonPress} />
      <Picker
        selectedValue={notificationTime}
        onValueChange={itemValue => {
          setNotificationTime(itemValue);
          handleNotificationTimeChange(itemValue);
          scheduleNotification(deadline, itemValue, taskText);
        }}>
        <Picker.Item label="Don't remind" value="dont_remind" />
        <Picker.Item label="1 Hour Before" value="1_hour" />
        <Picker.Item label="2 Hours Before" value="2_hours" />
        <Picker.Item label="1 Day Before" value="1_day" />
        <Picker.Item label="2 Days Before" value="2_days" />
        <Picker.Item label="1 Week Before" value="1_week" />
      </Picker>
      <TaskList />
    </View>
  );
};

export default TaskIn;
