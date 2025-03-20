import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

// Hàm tạo bảng mục tiêu (goals) với cột userId
const createGoalsTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT,  
          day TEXT UNIQUE,             
          steps INTEGER,
          distance REAL,
          calories REAL,
          activeTime INTEGER
        )`
      );
    });
    console.log('Goals table created successfully with userId column');
  } catch (error) {
    console.error('Error creating goals table:', error);
  }
};

// Hàm lưu mục tiêu vào SQLite với userId
export const saveGoalToSQLite = async (db, userId, day, steps, distance, calories, activeTime) => {
  try {
    // Kiểm tra xem đã có mục tiêu cho day chưa, không quan tâm userId
    const checkResult = await db.executeSql(
      'SELECT * FROM goals WHERE day = ?',
      [day]
    );

    if (checkResult[0].rows.length > 0) {
      // Cập nhật bản ghi hiện có cho ngày đó
      await db.executeSql(
        `UPDATE goals SET steps = ?, distance = ?, calories = ?, activeTime = ?, userId = ? 
         WHERE day = ?`,
        [steps, distance, calories, activeTime, userId, day]
      );
      console.log(`Goal for ${day} updated with userId: ${userId}`);
    } else {
      // Thêm mới nếu chưa có bản ghi cho ngày đó
      await db.executeSql(
        `INSERT INTO goals (userId, day, steps, distance, calories, activeTime) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, day, steps, distance, calories, activeTime]
      );
      console.log(`New goal for ${day} inserted with userId: ${userId}`);
    }
  } catch (error) {
    console.error('Error saving goal:', error);
    throw error;
  }
};

// Hàm tải mục tiêu từ SQLite với userId
export const loadGoalFromSQLite = (db, userId, day) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Database connection not established!');
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM goals WHERE day = ?`, // Chỉ kiểm tra day
        [day],
        (_, { rows }) => {
          if (rows.length > 0) {
            const goal = rows.item(0);
            console.log(`Goal loaded for ${day}:`, goal);
            resolve(goal);
          } else {
            console.warn(`No goal found for ${day}`);
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error loading goal:', error);
          reject(error);
        }
      );
    });
  });
};

// Lấy mục tiêu gần nhất (trừ ngày hiện tại) với userId
export const loadLatestGoalFromSQLite = async (db, userId, today) => {
  try {
    const result = await db.executeSql(
      `SELECT * FROM goals WHERE day < ? ORDER BY day DESC LIMIT 1`, // Chỉ kiểm tra day
      [today]
    );
    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  } catch (error) {
    console.error('Error loading latest goal:', error);
    return null;
  }
};

// Lấy tất cả dữ liệu bảng goals
const getAllGoalsData = async (db) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Database connection not established!');
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM goals',
        [],
        (_, { rows }) => {
          const data = Array.from({ length: rows.length }, (_, i) => rows.item(i));
          console.log(`Fetched ${data.length} goals:`, data);
          resolve(data);
        },
        (_, error) => {
          console.error('Error fetching all goals:', error);
          reject(error);
        }
      );
    });
  });
};

// Hàm cập nhật userId cho dữ liệu cũ trong bảng goals khi đăng nhập
const assignUserIdToOldGoals = async (db, userId) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'UPDATE goals SET userId = ? WHERE userId IS NULL',
        [userId],
        () => console.log(`Assigned userId ${userId} to old goals`),
        (_, error) => console.error('Error updating userId:', error)
      );
    });
  } catch (error) {
    console.error('Error assigning userId to old goals:', error);
  }
};

export const deleteAllGoals = async (db) => {
  try {
    await db.executeSql('DELETE FROM goals');
    console.log('✅ Đã xóa toàn bộ dữ liệu trong bảng goals');
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu trong bảng goals:', error);
    throw error;
  }
};

export {
  createGoalsTable,
  getAllGoalsData,
  assignUserIdToOldGoals, // Thêm hàm mới
};