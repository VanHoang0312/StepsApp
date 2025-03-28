import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

// Hàm tạo bảng body với cột userId
const createBodyTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS body (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          userId TEXT,                
          gender TEXT,
          day TEXT UNIQUE,
          bodysize REAL,
          stepLength REAL,
          weight REAL,
          birthYear INTEGER
        )`
      );
    });
    console.log('Body table created successfully with userId column');
  } catch (error) {
    console.error('Error creating body table:', error);
  }
};

// Lưu dữ liệu với userId
const saveBodyToSQLite = async (db, userId, day, gender, bodysize, stepLength, weight, birthYear) => {
  try {
    const checkResult = await db.executeSql(
      'SELECT * FROM body WHERE day = ? ',
      [day]
    );

    if (checkResult[0].rows.length > 0) {
      // Cập nhật nếu đã có dữ liệu cho userId và day
      await db.executeSql(
        `UPDATE body SET gender = ?, bodysize = ?, stepLength = ?, weight = ?, birthYear = ?,  userId = ?
         WHERE day = ? `,
        [gender, bodysize, stepLength, weight, birthYear, userId, day]
      );
      console.log(`Body for ${day} updated for userId: ${userId}`);
    } else {
      // Thêm mới nếu chưa có
      await db.executeSql(
        `INSERT INTO body (userId, day, gender, bodysize, stepLength, weight, birthYear) VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [userId, day, gender, bodysize, stepLength, weight, birthYear]
      );
      console.log(`New body for ${day} inserted for userId: ${userId}`);
    }
  } catch (error) {
    console.error('Error saving body:', error);
  }
};

// Tải body với userId
const loadBodyFromSQLite = (db, userId, day) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Database connection not established!');
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM body WHERE day = ? AND (userId = ? OR userId IS NULL)`,
        [day, userId],
        (_, { rows }) => {
          if (rows.length > 0) {
            const body = rows.item(0);
            console.log(`Body loaded for ${day}:`, body);
            resolve(body);
          } else {
            console.warn(`No body found for ${day}`);
            resolve(null);
          }
        },
        (_, error) => {
          console.error('Error loading body:', error);
          reject(error);
        }
      );
    });
  });
};

// Tải body gần nhất với userId
const loadLatestBodyFromSQLite = async (db, userId, today) => {
  try {
    const result = await db.executeSql(
      `SELECT * FROM body WHERE day <  ? AND (userId = ? OR userId IS NULL) ORDER BY day DESC LIMIT 1`,
      [today, userId]
    );
    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  } catch (error) {
    console.error('Error loading latest body:', error);
    return null;
  }
};

// Lấy tất cả dữ liệu bảng body
const getAllbodyData = async (db) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error('Database connection not established!');
      reject(new Error('Database not initialized'));
      return;
    }

    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM body',
        [],
        (_, { rows }) => {
          const data = Array.from({ length: rows.length }, (_, i) => rows.item(i));
          console.log(`Fetched ${data.length} body records:`, data);
          resolve(data);
        },
        (_, error) => {
          console.error('Error fetching all body:', error);
          reject(error);
        }
      );
    });
  });
};

// Hàm cập nhật userId cho dữ liệu cũ trong bảng body khi đăng nhập
const assignUserIdToOldBody = async (db, userId) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'UPDATE body SET userId = ? WHERE userId IS NULL',
        [userId],
        () => console.log(`Assigned userId ${userId} to old body data`),
        (_, error) => console.error('Error updating userId:', error)
      );
    });
  } catch (error) {
    console.error('Error assigning userId to old body data:', error);
  }
};

export const deleteAllBody = async (db) => {
  try {
    await db.executeSql('DELETE FROM body');
    console.log('✅ Đã xóa toàn bộ dữ liệu trong bảng body');
  } catch (error) {
    console.error('❌ Lỗi khi xóa dữ liệu trong bảng goals:', error);
    throw error;
  }
};

export {
  createBodyTable,
  saveBodyToSQLite,
  loadBodyFromSQLite,
  loadLatestBodyFromSQLite,
  getAllbodyData,
  assignUserIdToOldBody,
};