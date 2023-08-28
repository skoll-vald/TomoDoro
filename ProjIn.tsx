import React, { useEffect, useState } from 'react';
import { View, TextInput } from 'react-native';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { RootStackParamList } from './NavigationTypes';

type ProjInScreenRouteProp = RouteProp<RootStackParamList, 'ProjIn'>;

interface ProjInScreenProps {
  route: ProjInScreenRouteProp;
}

const ProjIn: React.FC<ProjInScreenProps> = ({ route }) => {
  const [projectText, setProjectText] = useState(route.params.projectText);
  const navigation = useNavigation();

  const setTasks = route.params.setTasks; // Get the setTasks function
  const tasks = route.params.tasks; // Get the tasks array

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <TextInput
        style={{
          borderBottomWidth: 1,
          marginBottom: 20,
          fontSize: 16,
          padding: 5,
        }}
        value={projectText}
        onChangeText={text => {
          setProjectText(text);

          // Update the task text in the tasks array
          const updatedTasks = tasks.map(task =>
            task.text === route.params.projectText ? {...task, text} : task,
          );
          setTasks(updatedTasks);
        }}
      />
    </View>
  );
};

export default ProjIn;
