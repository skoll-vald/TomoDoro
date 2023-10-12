import React, {useState} from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

interface Task {
  text: string;
  completed: boolean;
}

const TaskList: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (newTask.trim() !== '') {
      setTasks([...tasks, {text: newTask, completed: false}]);
      setNewTask('');
    }
  };

  const toggleCompleted = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = !updatedTasks[index].completed;
    setTasks(updatedTasks);
  };

  return (
    <View style={{flex: 1, padding: 20}}>
      <ScrollView>
        {tasks.map((task, index) => (
          <View
            key={index}
            style={{flexDirection: 'row', alignItems: 'center', marginTop: 10}}>
            <TouchableOpacity onPress={() => toggleCompleted(index)}>
              <Text>{task.completed ? '☑' : '☐'}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{flex: 1}}>
              <Text
                style={{
                  textDecorationLine: task.completed ? 'line-through' : 'none',
                }}>
                {task.text}
              </Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          marginTop: 10,
        }}>
        <TextInput
          style={{flex: 1}}
          placeholder="Add a task"
          value={newTask}
          onChangeText={setNewTask}
          onSubmitEditing={addTask}
        />
      </View>
    </View>
  );
};

export default TaskList;
