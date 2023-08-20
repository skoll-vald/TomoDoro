import React, {useState} from 'react';
import {View, Text, Button} from 'react-native';
import GoogleSignIn from './Auth'; // Import your Auth component

const App = () => {
  return (
    <View>
      <GoogleSignIn />
    </View>
  );
};

export default App;
