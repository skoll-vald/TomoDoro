import * as React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GoogleSignIn from './Auth';
import {View, Text} from 'react-native';
import ProjIn from './ProjIn'; // Import Project Details Screen component
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

function App() {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
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
    </GestureHandlerRootView>
  );
}

export default App;
