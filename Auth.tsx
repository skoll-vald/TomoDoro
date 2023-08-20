import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';
import {
  View,
  Text,
  Button,
  ScrollView,
  StatusBar,
  SafeAreaView,
  Platform,
  Alert,
  StyleSheet,
} from 'react-native';

function GoogleSignIn() {
  async function onGoogleButtonPress() {
    // Check if your device supports Google Play
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    // Get the users ID token
    const {idToken} = await GoogleSignin.signIn();

    // Create a Google credential with the token
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // Sign-in the user with the credential
    return auth().signInWithCredential(googleCredential);
  }

  GoogleSignin.configure({
    webClientId:
      '416099688028-oi0evtbmlr0jeofe546qbrheh01nphjm.apps.googleusercontent.com',
  });

  return (
    <Button
      title="Google Sign-In"
      onPress={() =>
        onGoogleButtonPress().then(() => console.log('Signed in with Google!'))
      }
    />
  );
}

export default GoogleSignIn;
