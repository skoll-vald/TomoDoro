import React, {useState} from 'react';
import {View, Text, Button} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const averageLifeExpectancyYears = 73; // Average life expectancy in years
const weeksInYear = 52; // Number of weeks in a year

const App: React.FC = () => {
  const [birthDate, setBirthDate] = useState<Date | null>(null);
  const [remainingWeeks, setRemainingWeeks] = useState<number>(0);
  const [isDatePickerVisible, setDatePickerVisibility] = useState<boolean>(false);
  const [weeksLived, setWeeksLived] = useState<number>(0);

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

  const calculateRemainingWeeks = () => {
    if (birthDate) {
      const currentDate = new Date();
      const ageInMilliseconds = currentDate.getTime() - birthDate.getTime();
      const ageInYears = ageInMilliseconds / (1000 * 60 * 60 * 24 * 365.25);
      const yearsRemaining = Math.max(0, averageLifeExpectancyYears - ageInYears);
      const weeksRemaining = Math.floor(yearsRemaining * weeksInYear);
      setRemainingWeeks(weeksRemaining);
      setWeeksLived(Math.floor(ageInYears * weeksInYear));
    }
  };

  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
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

      <Button title="Calculate Weeks" onPress={calculateRemainingWeeks} />

      {remainingWeeks > 0 && (
        <View style={{marginTop: 20}}>
          <Text>Total weeks of life: {weeksLived + remainingWeeks}</Text>
          <Text>Weeks lived: {weeksLived}</Text>
          <Text>Weeks left to live: {remainingWeeks}</Text>
          <View style={{flexDirection: 'row', marginTop: 10}}>
            <View
              style={{
                width: `${(weeksLived / (weeksLived + remainingWeeks)) * 100}%`,
                height: 10,
                backgroundColor: 'green',
              }}
            />
            <View
              style={{
                width: `${(remainingWeeks / (weeksLived + remainingWeeks)) * 100}%`,
                height: 10,
                backgroundColor: 'lightgray',
              }}
            />
          </View>
        </View>
      )}
    </View>
  );
};

export default App;
