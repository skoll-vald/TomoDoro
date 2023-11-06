import PushNotification from 'react-native-push-notification';

function scheduleNotification(
  deadline: Date | null,
  notificationTime: string,
  projectText: string,
) {
  if (notificationTime === 'dont_remind') {
    // Don't schedule a notification if "Don't remind" is chosen.
    return;
  }

  const timeIntervals: {
    dont_remind: number;
    '1_hour': number;
    '2_hours': number;
    '1_day': number;
    '2_days': number;
    '1_week': number;
    [key: string]: number; // Index signature to allow string keys
  } = {
    dont_remind: 0,
    '1_hour': 1,
    '2_hours': 2,
    '1_day': 24,
    '2_days': 48,
    '1_week': 168,
  };

  if (deadline !== null) {
    // Check if deadline is not null
    console.log(
      'scheduleNotification called with:',
      deadline,
      notificationTime,
      projectText,
    );
    const notificationDate = new Date(deadline);
    const hoursBeforeDeadline = timeIntervals[notificationTime];

    if (hoursBeforeDeadline) {
      notificationDate.setHours(
        notificationDate.getHours() - hoursBeforeDeadline,
      );

      PushNotification.localNotificationSchedule({
        channelId: 'channel-id',
        title: `${projectText}`,
        message: `Deadline is approaching at ${deadline.toLocaleDateString()} in ${deadline.toLocaleTimeString()}!`,
        date: notificationDate,
      });
    }
  }
}

export default scheduleNotification;
