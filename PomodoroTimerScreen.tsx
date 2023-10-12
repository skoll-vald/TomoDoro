import React, {useEffect, useState} from 'react';
import {View, Text, TouchableOpacity, StyleSheet} from 'react-native';

const PomodoroTimerScreen = () => {
  const workDuration = 27;
  const breakDuration = 9;

  const [seconds, setSeconds] = useState(workDuration);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [remainingTime, setRemainingTime] = useState(workDuration);

  const handleProgressBarClick = () => {
    setIsRunning(prevState => !prevState);
  };

  useEffect(() => {
    let intervalId;

    const totalSeconds = isBreak ? breakDuration : workDuration;
    const remainingTime = totalSeconds - seconds;
    setRemainingTime(remainingTime);

    if (isRunning && seconds > 0) {
      intervalId = setInterval(() => {
        setSeconds(prevSeconds => prevSeconds - 1);
      }, 1000);
    }

    if (isRunning && seconds === 0) {
      setIsBreak(prevIsBreak => !prevIsBreak);
      setSeconds(isBreak ? workDuration : breakDuration);
    }

    return () => clearInterval(intervalId);
  }, [isRunning, seconds, isBreak, workDuration, breakDuration]);

  const resetTimer = () => {
    setIsBreak(prevIsBreak => !prevIsBreak);
    setSeconds(isBreak ? workDuration : breakDuration);
    setIsRunning(true);
  };

  // Calculate the percentage of time remaining
  const percentageRemaining =
    (remainingTime / (isBreak ? breakDuration : workDuration)) * 100;

  return (
    <TouchableOpacity
      onPress={handleProgressBarClick}
      style={[
        styles.container,
        {
          backgroundColor: isBreak
            ? isRunning
              ? 'green' // Light green background for running break
              : 'lightgreen' // Green background for paused break
            : isRunning
            ? 'red' // Light red background for running work
            : 'lightcoral', // Red background for paused work
        },
      ]}>
      <View style={styles.middle}>
        <Text style={styles.timerText}>
          {`${Math.floor(seconds / 60)
            .toString()
            .padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`}
        </Text>
      </View>
      <TouchableOpacity onPress={resetTimer} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>
          {isBreak
            ? isRunning
              ? 'Work'
              : 'Continue Break'
            : isRunning
            ? 'Break'
            : 'Continue Work'}
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  middle: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  progress: {
    height: '100%',
    backgroundColor: 'rgba(20, 200, 20, 0.8)',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  timerText: {
    fontSize: 32,
  },
  resetButton: {
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#007BFF',
    borderRadius: 5,
  },
  resetButtonText: {
    color: 'white',
  },
  timerState: {
    marginTop: 16,
    fontSize: 20,
  },
});

export default PomodoroTimerScreen;
