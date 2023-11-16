import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';
import Task from './TaskList';

export const renderSwipeableRow = (task: typeof Task) => {
  const renderRightActions = () => (
    <TouchableOpacity
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '100%',
        padding: 10,
      }}
      onPress={() => deleteTask(task.id)}>
      <Text style={{color: 'white'}}>Delete</Text>
    </TouchableOpacity>
  );

  const renderLeftActions = () => (
    <TouchableOpacity
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'flex-end',
        height: '100%',
        padding: 10,
      }}
      onPress={() => deleteTask(task.id)}>
      <Text style={{color: 'white'}}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity
      onPress={() => navigateToTaskIn(task.id, task.text, parentTaskId)}>
      <Swipeable
        renderRightActions={renderRightActions}
        renderLeftActions={renderLeftActions}
        overshootRight={false}
        overshootLeft={false}>
        <View
          style={{
            backgroundColor: 'white',
            flexDirection: 'row',
            alignItems: 'center',
            paddingTop: 10,
            padding: 10,
            borderBottomWidth: 1,
            borderBlockColor: 'lightgray',
          }}>
          <TouchableOpacity
            onPress={() => toggleCompleted(task.id, !task.completed)}>
            <Text
              style={{
                color: task.completed ? 'green' : 'gray',
              }}>
              {task.completed ? '☑' : '☐'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingLeft: 10,
            }}
            onPress={() =>
              navigateToTaskIn(task.id, task.text, parentTaskId || '')
            }>
            <Text
              style={{
                color: task.completed ? 'lightgray' : 'black',
                textDecorationLine: task.completed ? 'line-through' : 'none',
                paddingRight: 10,
                fontWeight: 'bold',
              }}>
              {task.text}
            </Text>
          </TouchableOpacity>
        </View>
      </Swipeable>
    </TouchableOpacity>
  );
};