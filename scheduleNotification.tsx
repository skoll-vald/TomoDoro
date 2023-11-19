import PushNotification from 'react-native-push-notification';

function scheduleNotification(
  deadline: Date | null,
  notificationTime: string,
  taskText: string,
  notificationId: string,
) {
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

  if (notificationTime === 'dont_remind') {
    PushNotification.cancelLocalNotification(`${notificationId}`);
  }

  if (deadline !== null) {
    // Check if deadline is not null
    console.log(
      'scheduleNotification called with:',
      deadline,
      notificationTime,
      taskText,
      notificationId,
    );
    const notificationDate = new Date(deadline);
    const hoursBeforeDeadline = timeIntervals[notificationTime];

    if (hoursBeforeDeadline) {
      PushNotification.cancelLocalNotification(`${notificationId}`);
      notificationDate.setHours(
        notificationDate.getHours() - hoursBeforeDeadline,
      );

      PushNotification.localNotificationSchedule({
        id: `${notificationId}`,
        channelId: 'channel-id',
        title: `${taskText}`,
        message: `Deadline is approaching at ${deadline.toLocaleDateString()} in ${deadline.toLocaleTimeString()}!`,
        date: notificationDate,
        actions: ['Отложить на час'],
        invokeApp: false,
      });
    }
  }
}

PushNotification.configure({
  // other configuration settings...

  onAction: function (notification) {
    console.log('ACTION:', notification.action);
    console.log('NOTIFICATION:', notification);

    if (notification.action === 'Отложить на час') {
      // Use the existing notification ID
      const existingNotificationId = notification.id;

      // Calculate a new date for rescheduling (e.g., an hour later from now)
      const rescheduledDate = new Date();
      rescheduledDate.setHours(rescheduledDate.getHours() + 1);

      // Reschedule the notification
      PushNotification.localNotificationSchedule({
        id: existingNotificationId,
        channelId: 'channel-id',
        date: rescheduledDate,
        actions: ['Отложить на час'],
        invokeApp: false,
        message: `${notification.message}`,
      });
      console.log(`Notification delayed for an hour ${rescheduledDate}`);
    }
  },
});

export default scheduleNotification;
