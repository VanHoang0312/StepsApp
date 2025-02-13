import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const openDB = async () => {
  try {
    const db = await SQLite.openDatabase({ name: 'stepsApp.db', location: 'default' });
    console.log('Database opened successfully');
    return db;
  } catch (error) {
    console.error('Error opening database:', error);
  }
};

// Hàm tạo bảng hoạt động (steps tracking)
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
// const loadStepsFromSQLite = async (db, setStepCount) => {
//   try {
//     const today = new Date().toISOString().split('T')[0];

//     db.transaction((tx) => {
//       tx.executeSql(
//         'SELECT * FROM activity WHERE day = ?',
//         [today],
//         (tx, results) => {
//           if (results.rows.length > 0) {
//             const row = results.rows.item(0);
//             console.log('Loaded data:', row);
//             setStepCount(row.steps);
//           } else {
//             console.log('No data found for today');
//           }
//         },
//         (tx, error) => {
//           console.error('Error executing SQL:', error);
//         }
//       );
//     });
//   } catch (error) {
//     console.error('Error loading from SQLite:', error);
//   }
// };

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



// Hàm tạo bảng mục tiêu (goals)
const createGoalsTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS goals (
          id INTEGER PRIMARY KEY AUTOINCREMENT, 
          goal_steps INTEGER, 
          goal_distance REAL, 
          goal_calories REAL, 
          created_at TEXT,
          activeTime INTEGER
        )`
      );
    });
    console.log('Goals table created successfully');
  } catch (error) {
    console.error('Error creating goals table:', error);
  }
};

// Hàm chèn dữ liệu vào bảng activity
const insertActivity = async (db, day, steps, distance, calories, activeTime) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'INSERT INTO activity (day, steps, distance, calories, activeTime) VALUES (?, ?, ?, ?, ?)',
        [day, steps, distance, calories, activeTime]
      );
      console.log('Activity inserted successfully');
    });
  } catch (error) {
    console.error('Error inserting activity:', error);
  }
};

// Hàm chèn mục tiêu mới vào bảng goals
const insertGoal = async (db, goal_steps, goal_distance, goal_calories) => {
  try {
    const createdAt = new Date().toISOString();
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'INSERT INTO goals (goal_steps, goal_distance, goal_calories, created_at) VALUES (?, ?, ?, ?)',
        [goal_steps, goal_distance, goal_calories, createdAt]
      );
      console.log('Goal inserted successfully');
    });
  } catch (error) {
    console.error('Error inserting goal:', error);
  }
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

// Hàm lấy mục tiêu mới nhất từ bảng goals
const getLatestGoal = async (db) => {
  try {
    return new Promise((resolve, reject) => {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT * FROM goals ORDER BY created_at DESC LIMIT 1',
          [],
          (tx, results) => {
            if (results.rows.length > 0) {
              resolve(results.rows.item(0));
            } else {
              resolve(null);
            }
          },
          (tx, error) => {
            console.error('Error fetching goal:', error);
            reject(error);
          }
        );
      });
    });
  } catch (error) {
    console.error('Error getting goal:', error);
  }
};

// Hàm khởi tạo database (tạo cả hai bảng nếu chưa có)
const initializeDatabase = async () => {
  const db = await openDatabase();
  await createActivityTable(db);
  await createGoalsTable(db);
  return db;
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
  openDB,
  createTable,
  saveStepsToSQLite,
  loadStepsFromSQLite,
  initializeDatabase,
  insertActivity,
  insertGoal,
  getLatestGoal,
  getActivityByDay,
  getAllActivityData
};
