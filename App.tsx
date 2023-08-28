import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GoogleSignIn from './Auth';
import {View, Text} from 'react-native';
import ProjIn from './ProjIn'; // Import your ProjectDetailsScreen component

const Stack = createNativeStackNavigator();

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Projects">
        <Stack.Screen name="Projects" component={GoogleSignIn} />
        <Stack.Screen
          name="ProjIn"
          component={ProjIn}
          options={{title: 'Project Overview'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
