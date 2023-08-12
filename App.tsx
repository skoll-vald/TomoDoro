import React, { useState } from 'react';
import { View, Text, Button } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const averageLifeExpectancy = 73; // Average life expectancy in years

const App: React.FC = () => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [remainingYears, setRemainingYears] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);

  const showDatePicker = () => {
    setDatePickerVisibility(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisibility(false);
  };

  const handleConfirm = (date: Date) => {
    setBirthDate(date);
    hideDatePicker();
  };

  const calculateRemainingYears = () => {
    if (birthDate) {
      const birthYear = birthDate.getFullYear();
      const currentYear = new Date().getFullYear();
      const age = currentYear - birthYear;
      const yearsRemaining = Math.max(0, averageLifeExpectancy - age);
      setRemainingYears(yearsRemaining);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title="Pick Birth Date" onPress={showDatePicker} />

      {isDatePickerVisible && (
        <DateTimePicker
          value={birthDate || new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => date && handleConfirm(date)}
        />
      )}

      <Text>
        {birthDate
          ? `Selected Birth Date: ${birthDate.toISOString().substr(0, 10)}`
          : 'No birth date selected'}
      </Text>

      <Button
        title="Calculate Remaining Years"
        onPress={calculateRemainingYears}
      />

      {remainingYears > 0 && (
        <Text>
          You have approximately {remainingYears} years left to live on average.
        </Text>
      )}
    </View>
  );
};

export default App;
