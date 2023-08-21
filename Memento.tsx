import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  Dimensions,
  StyleSheet,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import DateTimePicker from '@react-native-community/datetimepicker';
import auth from '@react-native-firebase/auth';

const averageLifeExpectancyYears = 74.02; // Average life expectancy in years
const weeksInYear = 52; // Number of weeks in a year

const Memento = () => {
  console.log('Memento component rendered'); // Add this line
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [remainingWeeks, setRemainingWeeks] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] =
    useState<boolean>(false);
  const [weeksLived, setWeeksLived] = useState<number>(0);
  const [dotSize, setDotSize] = useState<number>(0);

  const screenWidth = Dimensions.get('window').width;
  const horizontalGap = 3.6; // Horizontal gap between dots
  const dotsPerRow = 52; // Number of dots per row

  useEffect(() => {
    // Calculate adjusted dot size based on screen width, gaps, and number of dots per row
    const adjustedDotSize =
      (screenWidth - (dotsPerRow - 1) * horizontalGap) / dotsPerRow;
    setDotSize(adjustedDotSize);
  }, [screenWidth]);

  useEffect(() => {
    calculateRemainingWeeks(); // Calculate automatically when the user selects a date
  });

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = async (date: Date) => {
    setBirthDate(date);
    hideDatePicker();

    const currentUser = auth().currentUser; // Get the current user
    if (currentUser) {
      const userDocRef = firestore().collection('users').doc(currentUser.uid); // Reference to the user's document
      try {
        await userDocRef.set({birthDate: date.toISOString()}); // Save the birth date in the user's document
        calculateRemainingWeeks(); // Calculate automatically when the user selects a date
      } catch (error) {
        console.error('Error saving birth date to Firestore:', error);
      }
    }
  };

  useEffect(() => {
    const retrieveBirthDate = async () => {
      const currentUser = auth().currentUser; // Get the current user
      if (currentUser) {
        const userDocRef = firestore().collection('users').doc(currentUser.uid); // Reference to the user's document
        try {
          const userDocSnapshot = await userDocRef.get();
          if (userDocSnapshot.exists) {
            const birthDate = userDocSnapshot.data()?.birthDate;
            if (birthDate) {
              setBirthDate(new Date(birthDate));
            }
          }
        } catch (error) {
          console.error('Error retrieving birth date from Firestore:', error);
        }
      }
    };
    retrieveBirthDate();
  }, []);

  const calculateRemainingWeeks = () => {
    if (birthDate) {
      const currentDate = new Date();
      const ageInMilliseconds = currentDate.getTime() - birthDate.getTime();
      const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
      const yearsRemaining = Math.max(
        0,
        averageLifeExpectancyYears - ageInYears,
      );
      const weeksRemaining = Math.floor(yearsRemaining * weeksInYear);
      setRemainingWeeks(weeksRemaining);
      setWeeksLived(Math.floor(ageInYears * weeksInYear));
    }
  };

  const calculateDeathDate = (birthDate: Date): Date => {
    const deathDate = new Date(birthDate);
    deathDate.setDate(deathDate.getDate() + 52 * 74 * 7);
    return deathDate;
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    buttonContainer: {
      marginTop: 20,
    },
    dotRow: {
      flexDirection: 'row',
      justifyContent: 'center', // Center-align the dots horizontally
      width: '100%', // Set width to 100% to span the entire container
      marginBottom: 3, // Add some spacing between rows
    },
    dot: {
      width: dotSize,
      height: dotSize,
      borderRadius: dotSize / 2,
    },
    dotWithMargin: {
      marginRight: 12, // Increased margin for every 4th dot
    },
  });

  const renderDots = (totalWeeks: number) => {
    const rows = Math.ceil(totalWeeks / weeksInYear);

    const dotElements = [];
    for (let i = 0; i < rows; i++) {
      const rowDots = Math.min(weeksInYear, totalWeeks - i * weeksInYear);
      const dotRow = (
        <View
          style={[
            styles.dotRow,
            {width: rowDots * (dotSize + horizontalGap) - horizontalGap},
          ]}
          key={i}>
          {Array(rowDots)
            .fill(0)
            .map((_, j) => {
              const dotIndex = i * weeksInYear + j;
              const isFourthDot = (j + 1) % 4 === 0; // Check if it's the 4th dot in a row
              const hasMargin = isFourthDot && j !== rowDots - 1; // Apply margin to the 4th dot and not the last dot
              return (
                <View
                  key={j}
                  style={[
                    styles.dot,
                    hasMargin && styles.dotWithMargin, // Apply margin conditionally
                    {
                      backgroundColor:
                        dotIndex < weeksLived ? 'black' : 'lightgray',
                    },
                  ]}
                />
              );
            })}
        </View>
      );

      dotElements.push(dotRow);
    }
    return dotElements;
  };

  return (
    <View style={styles.container}>
      <Button title="Pick Birth Date" onPress={showDatePicker} />

      {isDatePickerVisible && (
        <DateTimePicker
          value={birthDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => date && handleConfirm(date)}
        />
      )}

      {birthDate && (
        <Text>
          Selected Birth Date: {birthDate.toISOString().substr(0, 10)}
        </Text>
      )}

      {birthDate && (
        <Text>
          Death Date:{' '}
          {calculateDeathDate(birthDate)?.toISOString().substr(0, 10)}
        </Text>
      )}

      {remainingWeeks > 0 && (
        <ScrollView
          style={styles.buttonContainer}
          contentContainerStyle={{alignItems: 'center'}}>
          {renderDots(weeksLived + remainingWeeks)}
        </ScrollView>
      )}
    </View>
  );
};

export default Memento;
