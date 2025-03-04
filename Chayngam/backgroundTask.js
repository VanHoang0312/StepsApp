import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';

const BACKGROUND_TASK = 'background-task';

TaskManager.defineTask(BACKGROUND_TASK, async () => {
    //console.log('Ứng dụng đang chạy ngầm!');
    return BackgroundFetch.BackgroundFetchResult.NewData;
});

export async function registerBackgroundTask() {
    const isRegistered = await TaskManager.isTaskRegisteredAsync(BACKGROUND_TASK);
    if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BACKGROUND_TASK, {
            minimumInterval: 60, // Chạy mỗi 60 giây
            stopOnTerminate: false,
            startOnBoot: true,
        });
        console.log('Đã kích hoạt chế độ chạy ngầm');
    }
}