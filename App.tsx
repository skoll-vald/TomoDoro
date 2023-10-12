import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GoogleSignIn from './Auth';
import TaskIn from './TaskIn'; // Import Project Details Screen component
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Tasks">
          <Stack.Screen name="Tasks" component={GoogleSignIn} />
          <Stack.Screen
            name="TaskIn"
            component={TaskIn}
            options={{title: 'Task Overview'}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

export default App;
