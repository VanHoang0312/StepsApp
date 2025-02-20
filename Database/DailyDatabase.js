import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

// Hàm tạo bảng hoạt động
const createTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'CREATE TABLE IF NOT EXISTS activity (id INTEGER PRIMARY KEY AUTOINCREMENT, day TEXT, steps INTEGER, distance REAL, calories REAL, activeTime INTEGER)'
      );
    });
    console.log("Table created successfully");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

// Lưu dữ liệu
const saveStepsToSQLite = async (db, steps, distance, calories, activeTime) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    await db.transaction(async (tx) => {
      // Kiểm tra nếu đã có dữ liệu hôm nay
      tx.executeSql(
        'SELECT * FROM activity WHERE day = ?',
        [today],
        (tx, results) => {
          if (results.rows.length > 0) {
            // Đã có dữ liệu => Chỉ cập nhật thay vì thêm mới
            tx.executeSql(
              'UPDATE activity SET steps = ?, distance = ?, calories = ?, activeTime = ? WHERE day = ?',
              [steps, distance, calories, activeTime, today],
              () => console.log('Updated existing record'),
              (tx, error) => console.error('Error updating record:', error)
            );
          } else {
            // Chưa có dữ liệu => Thêm mới
            tx.executeSql(
              'INSERT INTO activity (day, steps, distance, calories, activeTime) VALUES (?, ?, ?, ?, ?)',
              [today, steps, distance, calories, activeTime],
              () => console.log('Inserted new record'),
              (tx, error) => console.error('Error inserting record:', error)
            );
          }
        },
        (tx, error) => console.error('Error checking existing record:', error)
      );
    });
  } catch (error) {
    console.error('Error saving data to SQLite:', error);
  }
};


// Load dữ liệu
const loadStepsFromSQLite = async (db) => {
  return new Promise((resolve, reject) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      db.transaction((tx) => {
        tx.executeSql(
          'SELECT day, steps, calories, distance, activeTime FROM activity WHERE day = ?',
          [today],
          (tx, results) => {
            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              console.log("Loaded data from SQLite:", row);
              resolve({
                day: row.day,
                steps: row.steps || 0,
                calories: row.calories || 0,
                distance: row.distance || 0,
                activeTime: row.activeTime || 0
              });
            } else {
              console.log("No data found for today, defaulting to 0.");
              resolve({
                day: today,
                steps: 0,
                calories: 0,
                distance: 0,
                activeTime: 0
              });
            }
          },
          (tx, error) => {
            console.error("Error executing SQL:", error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error("Error loading from SQLite:", error);
      reject(error);
    }
  });
};

// Hàm lấy dữ liệu theo ngày từ bảng activity
const getActivityByDay = async (db, day) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM activity WHERE day = ?',
          [day],
          (tx, results) => {
            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              console.log(`Data for ${day}:`, row);
              resolve(row);
            } else {
              console.log(`No data found for ${day}`);
              resolve(null);
            }
          },
          (tx, error) => {
            console.error(`Error fetching data for ${day}:`, error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error(` Error in getActivityByDay:`, error);
      reject(error);
    }
  });
};

// Hàm lấy toàn bộ dữ liệu từ bảng activity
const getAllActivityData = async (db) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM activity',
          [],
          (tx, results) => {
            const rows = results.rows;
            let data = [];
            for (let i = 0; i < rows.length; i++) {
              data.push(rows.item(i));
            }
            console.log("Tất cả dữ liệu bảng Activity:", data);
            resolve(data);
          },
          (tx, error) => {
            console.error('Lỗi khi lấy toàn bộ dữ liệu:', error);
            reject(error);
          }
        );
      });
    } catch (error) {
      console.error('Lỗi lấy dữ liệu từ SQLite:', error);
      reject(error);
    }
  });
};

export {
  createTable,
  saveStepsToSQLite,
  loadStepsFromSQLite,
  getActivityByDay,
  getAllActivityData,
};

