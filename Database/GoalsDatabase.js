import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

// Hàm tạo bảng mục tiêu (goals)
const createGoalsTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT, 
            day TEXT, 
            steps INTEGER, 
            distance REAL, 
            calories REAL, 
            activeTime INTEGER
          )`
      );
    });
    console.log('Goals table created successfully');
  } catch (error) {
    console.error('Error creating goals table:', error);
  }
};


// Hàm lưu mục tiêu vào SQLite
export const saveGoalToSQLite = async (db, day, steps, distance, calories, activeTime) => {
  try {
    const checkResult = await db.executeSql('SELECT * FROM goals WHERE day = ?', [day]);

    if (checkResult[0].rows.length > 0) {
      // Cập nhật nếu đã có mục tiêu
      await db.executeSql(
        `UPDATE goals SET steps = ?, distance = ?, calories = ?, activeTime = ? WHERE day = ?`,
        [steps, distance, calories, activeTime, day]
      );
      console.log(`Goal for ${day} updated.`);
    } else {
      // Thêm mới nếu chưa có
      await db.executeSql(
        `INSERT INTO goals (day, steps, distance, calories, activeTime) VALUES (?, ?, ?, ?, ?)`,
        [day, steps, distance, calories, activeTime]
      );
      console.log(`New goal for ${day} inserted.`);
    }
  } catch (error) {
    console.error('Error saving goal:', error);
  }
};


// Hàm tải mục tiêu từ SQLite
export const loadGoalFromSQLite = (db, day) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM goals WHERE day = ?`,
        [day],
        (_, { rows }) => {
          if (rows.length > 0) {
            const goal = rows.item(0);
            console.log(`Goal loaded for ${day}:`, goal);
            resolve(goal);
          } else {
            console.warn(` No goal found for ${day}`);
            resolve(null);
          }
        },
        (_, error) => {
          console.error(' Error loading goal:', error);
          reject(error);
        }
      );
    });
  });
};

// Lấy mục tiêu gần nhất (trừ ngày hiện tại)
export const loadLatestGoalFromSQLite = async (db, today) => {
  try {
    const result = await db.executeSql(
      `SELECT * FROM goals WHERE day < ? ORDER BY day DESC LIMIT 1`, [today]
    );
    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  } catch (error) {
    console.error('Error loading latest goal:', error);
    return null;
  }
};

//lấy tất cả dữ liệu bảng goals
const getAllGoalsData = async (db) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error(' Database connection not established!');
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM goals',
        [],
        (_, { rows }) => {
          const data = Array.from({ length: rows.length }, (_, i) => rows.item(i));
          console.log(` Fetched ${data.length} goals:`, data);
          resolve(data);
        },
        (_, error) => {
          console.error(' Error fetching all goals:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

export {
  createGoalsTable,
  getAllGoalsData
};
