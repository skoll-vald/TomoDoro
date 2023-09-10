import React from 'react';
import {View, Text, TouchableOpacity} from 'react-native';
import {Swipeable} from 'react-native-gesture-handler';

interface ListItemProps {
  text: string;
  completed: boolean;
  onDelete: () => void; // onDelete function passed as a prop
  onPress: () => void;
  onComplete: (completed: boolean) => void; // Add the onComplete prop
}

const ListItem: React.FC<ListItemProps> = ({
  text,
  completed,
  onDelete,
  onPress,
  onComplete,
}) => {
  const renderRightActions = () => (
    <TouchableOpacity
      style={{
        backgroundColor: 'red',
        justifyContent: 'center',
        alignItems: 'flex-start',
        height: '100%',
        padding: 10,
      }}
      onPress={onDelete} // Call the onDelete function when pressed
    >
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
      onPress={onDelete} // Call the onDelete function when pressed
    >
      <Text style={{color: 'white'}}>Delete</Text>
    </TouchableOpacity>
  );

  return (
    <TouchableOpacity onPress={onPress}>
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
            onPress={() => {
              // Toggle the completed status
              const newCompleted = !completed;
              // Call the onComplete prop with the new status
              onComplete(newCompleted);
            }}>
            <Text style={{color: completed ? 'green' : 'gray'}}>
              {completed ? '☑' : '☐'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              flex: 1,
              paddingLeft: 10,
            }}
            onPress={onPress}>
            <Text
              style={{
                color: completed ? 'lightgray' : 'black',
                textDecorationLine: completed ? 'line-through' : 'none',
                paddingRight: 10,
                fontWeight: 'bold',
              }}>
              {text}
            </Text>
          </TouchableOpacity>
        </View>
      </Swipeable>
    </TouchableOpacity>
  );
};

export default ListItem;
