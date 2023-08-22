import React, {useState, useEffect} from 'react';
import auth from '@react-native-firebase/auth';
import FirebaseAuthTypes from '@react-native-firebase/app';
import Prolist from './Prolist';
import {
  GoogleSignin,
  GoogleSigninButton,
  statusCodes,
} from '@react-native-community/google-signin';
import {Button, Text, View} from 'react-native'; // Import only the necessary component

function GoogleSignIn() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Configure Google Sign-In
    GoogleSignin.configure({
      webClientId:
        '416099688028-oi0evtbmlr0jeofe546qbrheh01nphjm.apps.googleusercontent.com',
    });

    // Set up the auth state change listener
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

    // Once the listener is set up and Firebase connection is established, set initializing to false
    setInitializing(false);

    // Handle user state changes
    function onAuthStateChanged(user) {
      setUser(user);
      if (initializing) {
        setInitializing(false);
      }
    }

    // Unsubscribe the listener when the component is unmounted
    return () => subscriber();
  }, [initializing]);

  // Function to handle Google Sign-In
  async function onGoogleButtonPress() {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});
    const {idToken} = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    return auth().signInWithCredential(googleCredential);
  }

  // Render the appropriate content based on the user's authentication state
  if (initializing) {
    return null; // Wait while initializing
  }

  if (!user) {
    return (
      <Button
        title="Google Sign-In"
        onPress={() =>
          onGoogleButtonPress().then(() =>
            console.log('Signed in with Google!'),
          )
        }
      />
    );
  }

  return (
    <>
      <Prolist />
      <Button
        title="Sign Out"
        onPress={() =>
          auth()
            .signOut()
            .then(() => console.log('Signed out'))
        }
      />
    </>
  );
}

export default GoogleSignIn;
