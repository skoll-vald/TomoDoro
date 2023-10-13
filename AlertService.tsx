import {Alert} from 'react-native';

// Function to show a confirmation alert
export const showConfirmationAlert = (
  title: string,
  message: string,
  onConfirm: () => void,
) => {
  Alert.alert(
    title,
    message,
    [
      {
        text: 'Cancel',
        style: 'cancel',
      },
      {
        text: 'Delete',
        onPress: onConfirm,
        style: 'destructive',
      },
    ],
    {cancelable: true},
  );
};
