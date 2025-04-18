import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

const openDB = async () => {
  try {
    const db = await SQLite.openDatabase({ name: 'stepsApp7.db', location: 'default' });
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
  }
};

export { openDB };
