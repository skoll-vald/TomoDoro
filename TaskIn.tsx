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
    updatedText: taskText,
    deadline: null,
    description: '',
  });
  const [updatedText, setUpdatedText] = useState('');
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
            console.log('Fetched Task Data:', taskData);
            if (taskData.deadline) {
              setDeadline(new Date(taskData.deadline));
            }
            if (taskData.text) {
              setTaskData(prevData => ({
                ...prevData,
                updatedText: taskData.text,
              }));
            }
            if (taskData.description) {
              setDescription(taskData.description); // Set the description directly
            }
          }
        }
      } catch (error) {
        console.error('Error fetching task data:', error);
      }
    };
    fetchTaskData();
  }, [taskId]);

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
  
            // Initialize state with default or empty values
            let updatedText = '';
            let taskDescription = '';
            let taskDeadline = null;
  
            if (taskData.text) {
              setTaskData(prevData => ({
                ...prevData,
                updatedText: taskData.text,
              }));
            }
  
            if (taskData.description) {
              taskDescription = taskData.description;
            }
  
            if (taskData.deadline) {
              taskDeadline = new Date(taskData.deadline);
            }
  
            // Update the state
            setUpdatedText(updatedText);
            setDescription(taskDescription);
            setDeadline(taskDeadline);
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
        value={taskData.updatedText}
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
          scheduleNotification(deadline, itemValue, taskText);
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
