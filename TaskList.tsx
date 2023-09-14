import React, {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';
import ListItem from './ListItem'; // Import the ListItem component
import {toggleCompletionStatus, ItemType} from './toggleCompletionStatus';
import {deleteItem} from './deleteItem';
import {showConfirmationAlert} from './AlertService';
import {
  addItemToCollection,
  CollectionType,
  ItemData,
} from './addItemToCollection';
import {fetchCollectionData} from './fetchCollectionData';

interface Task {
  id: string;
  text: string;
  completed: boolean;
}

interface TaskListProps {
  projectId: string; // The ID of the project for which tasks should be displayed
}

const TaskList: React.FC<TaskListProps> = ({projectId}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  // Fetch tasks for the specified project
  const fetchTasks = async () => {
    try {
      const tasksData = await fetchCollectionData(
        CollectionType.Tasks,
        projectId,
      );
      setTasks(tasksData as Task[]);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  // Add a new task to the project
  const addTask = async () => {
    try {
      if (newTask.trim() !== '') {
        const newTaskData: ItemData = {
          text: newTask,
          completed: false,
        };

        await addItemToCollection(CollectionType.Tasks, newTaskData, projectId); // Pass projectId as parentId
        fetchTasks(); // Fetch the updated list of tasks
        setNewTask('');
      }
    } catch (error) {
      console.error('Error adding task:', error);
    }
  };

  const toggleTaskCompleted = async (taskId: string, completed: boolean) => {
    try {
      // Call your toggleCompletionStatus function with the task ID and 'tasks' itemType
      await toggleCompletionStatus(taskId, ItemType.Task, completed, projectId);
      fetchTasks();
    } catch (error) {
      console.error('Error toggling task completion:', error, taskId);
    }
  };

  // Delete a task
  const onDeleteTask = async (taskId: string) => {
    try {
      await deleteItem(taskId, ItemType.Task);
      fetchTasks(); // Fetch the updated list of tasks
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  return (
    <View>
      <TextInput
        placeholder="Add a task"
        value={newTask}
        onChangeText={setNewTask}
        onSubmitEditing={addTask}
      />
      <View>
        {tasks.map(task => (
          <ListItem
            key={task.id}
            text={task.text}
            completed={task.completed}
            onDelete={() => onDeleteTask(task.id)}
            onPress={() => editTask(task.id)}
            onComplete={completed => toggleTaskCompleted(task.id, completed)}
          />
        ))}
      </View>
    </View>
  );
};

export default TaskList;
