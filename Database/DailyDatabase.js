import SQLite from 'react-native-sqlite-storage';
SQLite.enablePromise(true);

// Hàm tạo bảng hoạt động với cột userId
const createTable = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        `CREATE TABLE IF NOT EXISTS activity (
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
    console.log("Table created successfully with userId column");
  } catch (error) {
    console.error("Error creating table:", error);
  }
};

// Lưu dữ liệu với userId
const saveStepsToSQLite = async (db, userId, steps, distance, calories, activeTime) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log("🔍 Bắt đầu lưu dữ liệu:", { userId, today, steps, distance, calories, activeTime });

    db.transaction((tx) => {
      // Kiểm tra nếu đã có dữ liệu hôm nay với userId = NULL hoặc userId hiện tại
      tx.executeSql(
        'SELECT * FROM activity WHERE day = ?',
        [today],
        (_, results) => {
          console.log("📋 Kết quả SELECT:", results.rows.length > 0 ? results.rows.item(0) : "Không có bản ghi");

          if (results.rows.length > 0) {
            // Nếu đã có dữ liệu thì cập nhật
            tx.executeSql(
              'UPDATE activity SET userId = ?, steps = ?, distance = ?, calories = ?, activeTime = ? WHERE day = ?',
              [userId, steps, distance, calories, activeTime, today],
              (_, { rowsAffected }) => {
                console.log(`✅ Updated ${rowsAffected} record(s) with userId:`, userId);
                resolve();
              },
              (_, error) => {
                console.error('🚨 Lỗi khi UPDATE:', error);
                reject(error);
              }
            );
          } else {
            // Nếu chưa có dữ liệu thì thêm mới
            tx.executeSql(
              'INSERT INTO activity (userId, day, steps, distance, calories, activeTime) VALUES (?, ?, ?, ?, ?, ?)',
              [userId, today, steps, distance, calories, activeTime],
              (_, { insertId }) => {
                console.log('✅ Inserted new record with id:', insertId, 'for', today, 'with userId:', userId);
                resolve();
              },
              (_, error) => {
                console.error('🚨 Lỗi khi INSERT:', error);
                reject(error);
              }
            );
          }
        },
        (_, error) => {
          console.error('🚨 Lỗi khi SELECT:', error);
          reject(error);
        }
      );
    });

    console.log("💾 Hoàn tất lưu dữ liệu vào SQLite");

    // Kiểm tra dữ liệu ngay sau khi lưu
    const allData = await getAllActivityData(db);
    console.log("🔎 Kiểm tra sau khi lưu:", allData);
  } catch (error) {
    console.error('🚨 Lỗi tổng quát khi lưu dữ liệu vào SQLite:', error);
    throw error; // Ném lỗi để hàm gọi xử lý
  }
};


// Load dữ liệu
const loadStepsFromSQLite = async (db, userId, day) => {
  return new Promise((resolve, reject) => {
    try {
      db.transaction((tx) => {
        tx.executeSql(
          'SELECT userId, day, steps, calories, distance, activeTime FROM activity WHERE day = ? AND (userId = ? OR userId IS NULL)',
          [day, userId],
          (tx, results) => {
            if (results.rows.length > 0) {
              const row = results.rows.item(0);
              console.log("Loaded data from SQLite:", row);
              resolve({
                userId: row.userId || null,
                day: row.day,
                steps: row.steps || 0,
                calories: row.calories || 0,
                distance: row.distance || 0,
                activeTime: row.activeTime || 0
              });
            } else {
              console.log("No data found for today, defaulting to 0.");
              resolve({
                userId: userId,
                day: day,
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

// Hàm lấy dữ liệu theo ngày
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
      console.error(`Error in getActivityByDay:`, error);
      reject(error);
    }
  });
};

// Hàm lấy toàn bộ dữ liệu
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

// Hàm cập nhật userId cho dữ liệu cũ khi đăng nhập
const assignUserIdToOldData = async (db, userId) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'UPDATE activity SET userId = ? WHERE userId IS NULL',
        [userId],
        () => console.log(`Assigned userId ${userId} to old data for today`),
        (_, error) => console.error('Error updating userId:', error)
      );
    });
  } catch (error) {
    console.error('Error assigning userId to old data:', error);
  }
};

// Hàm xóa toàn bộ dữ liệu trong bảng Activity
const deleteAllActivityData = async (db) => {
  try {
    await db.transaction(async (tx) => {
      await tx.executeSql(
        'DELETE FROM activity',
        [],
        () => console.log("Đã xóa toàn bộ dữ liệu trong bảng Activity"),
        (_, error) => console.error("Lỗi khi xóa dữ liệu:", error)
      );
    });
  } catch (error) {
    console.error("Lỗi khi xóa toàn bộ dữ liệu trong bảng Activity:", error);
  }
};


export {
  createTable,
  saveStepsToSQLite,
  loadStepsFromSQLite,
  getActivityByDay,
  getAllActivityData,
  assignUserIdToOldData, // Thêm hàm mới
  deleteAllActivityData
};