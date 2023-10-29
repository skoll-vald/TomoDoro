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

type TaskInScreenRouteProp = Readonly<{
  key: string;
  name: 'TaskIn';
  path?: string;
}> &
  Readonly<{
    params: Readonly<{
      taskText: string;
      taskId?: string; // Make taskId optional
      parentTaskId: string;
    }>;
  }>;

interface TaskInScreenProps {
  route: TaskInScreenRouteProp;
}

const TaskIn: React.FC<TaskInScreenProps> = ({route}) => {
  const {taskId, taskText, parentTaskId} = route.params;
  console.log(taskId, taskText, parentTaskId);
  const [taskData, setTaskData] = useState({
    text: taskText,
    deadline: null,
    description: '',
  });
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
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
            console.log('Fetched Task Data:', taskData);

            const updatedTaskData = {
              text: taskData.text || '',
              description: taskData.description || '',
              deadline: taskData.deadline ? new Date(taskData.deadline) : null,
            };

            setTaskData(updatedTaskData);
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    fetchTaskData();
  }, [taskId]);

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
    setTaskData(prevData => ({...prevData, text}));
    await updateFieldInFirestore('text', text);
  };

  // Update deadline field
  const updateDlInFirestore = async (date: Date) => {
    scheduleNotification(date, notificationTime, taskText);
    await updateFieldInFirestore('deadline', date.toISOString());
    setTaskData(prevData => ({
      ...prevData,
      deadline: date,
    }));
    console.log(date);
  };

  // Update description field
  const updateDescriptionInFirestore = async (description: string) => {
    setTaskData(prevData => ({...prevData, description}));
    await updateFieldInFirestore('description', description);
    console.log(description);
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
        value={taskData.text}
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
        {taskData.deadline
          ? `${new Date(taskData.deadline).toLocaleDateString()} ${new Date(
              taskData.deadline,
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
        value={taskData.description}
        onChangeText={newDescription => {
          updateDescriptionInFirestore(newDescription);
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
          scheduleNotification(taskData.deadline, itemValue, taskText);
        }}>
        <Picker.Item label="Don't remind" value="dont_remind" />
        <Picker.Item label="1 Hour Before" value="1_hour" />
        <Picker.Item label="2 Hours Before" value="2_hours" />
        <Picker.Item label="1 Day Before" value="1_day" />
        <Picker.Item label="2 Days Before" value="2_days" />
        <Picker.Item label="1 Week Before" value="1_week" />
      </Picker>
      <TaskList parentTaskId={taskId} taskId={taskId} />
    </View>
  );
};

export default TaskIn;
