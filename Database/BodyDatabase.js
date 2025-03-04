import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

// Hàm tạo bảng body
const createBodyTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS body (
              id INTEGER PRIMARY KEY AUTOINCREMENT, 
              gender TEXT, 
              day TEXT,
              bodysize REAL, 
              stepLength REAL, 
              weight REAL, 
              birthYear INTEGER
            )`
      );
    });
    console.log('Body table created successfully');
  } catch (error) {
    console.error('Error creating body table:', error);
  }
};

//Lưu dữ liệu
const saveBodyToSQLite = async (db, day, gender, bodysize, stepLength, weight, birthYear) => {
  try {
    const checkResult = await db.executeSql('SELECT * FROM body WHERE day = ?', [day]);
    // const checkResult = await executeSqlAsync(db, 'SELECT * FROM body WHERE day = ?', [day]);

    if (checkResult[0].rows.length > 0) {
      // Cập nhật nếu đã có mục tiêu
      await db.executeSql(
        `UPDATE body SET gender = ?, bodysize = ?, stepLength = ?, weight = ?, birthYear = ? WHERE day = ?`,
        [gender, bodysize, stepLength, weight, birthYear, day]
      );
      console.log(`Body for ${day} updated.`);
    } else {
      // Thêm mới nếu chưa có
      await db.executeSql(
        `INSERT INTO body (day, gender, bodysize, stepLength, weight, birthYear ) VALUES (?, ?, ?, ?, ?, ?)`,
        [day, gender, bodysize, stepLength, weight, birthYear]
      );
      console.log(`New body for ${day} inserted.`);
    }
  } catch (error) {
    console.error('Error saving body:', error);
  }
};

//Tải body
const loadBodyFromSQLite = (db, day) => {
  return new Promise((resolve, reject) => {
    db.transaction((tx) => {
      tx.executeSql(
        `SELECT * FROM body WHERE day = ?`,
        [day],
        (_, { rows }) => {
          if (rows.length > 0) {
            const body = rows.item(0);
            console.log(`Body loaded for ${day}:`, body);
            resolve(body);
          } else {
            console.warn(` No body found for ${day}`);
            resolve(null);
          }
        },
        (_, error) => {
          console.error(' Error loading body:', error);
          reject(error);
        }
      );
    });
  });
};

const loadLatestBodyFromSQLite = async (db, today) => {
  try {
    const result = await db.executeSql(
      `SELECT * FROM body WHERE day < ? ORDER BY day DESC LIMIT 1`, [today]
    );
    return result[0].rows.length > 0 ? result[0].rows.item(0) : null;
  } catch (error) {
    console.error('Error loading latest body:', error);
    return null;
  }
};

//LẤy all dữ liệu
const getAllbodyData = async (db) => {
  return new Promise((resolve, reject) => {
    if (!db) {
      console.error(' Database connection not established!');
      reject(new Error('Database not initialized'));
      return;
    }
    db.transaction((tx) => {
      tx.executeSql(
        'SELECT * FROM body',
        [],
        (_, { rows }) => {
          const data = Array.from({ length: rows.length }, (_, i) => rows.item(i));
          console.log(` Fetched ${data.length} body:`, data);
          resolve(data);
        },
        (_, error) => {
          console.error(' Error fetching all body:', error);
          reject(error);
          return true;
        }
      );
    });
  });
};

// Xóa bảng body
// const dropBodyTable = async (db) => {
//   try {
//     await db.transaction(async (tx) => {
//       await tx.executeSql('DROP TABLE IF EXISTS body');
//     });
//     console.log('Body table dropped successfully');
//   } catch (error) {
//     console.error('Error dropping body table:', error);
//   }
// };


export {
  createBodyTable,
  saveBodyToSQLite,
  loadBodyFromSQLite,
  loadLatestBodyFromSQLite,
  getAllbodyData,
  //dropBodyTable
}