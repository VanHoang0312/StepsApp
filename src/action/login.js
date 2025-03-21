// import { loadLatestBodyFromSQLite } from "../../Database/BodyDatabase";
// import { openDB } from "../../Database/database";

export const checkLogin =(status)=>{
    return{
        type : "CHECK_LOGIN",
        status: status
        
    }
}

// Action load dữ liệu Body
// export const loadBodyData = (userId) => async (dispatch) => {
//     try {
//       const db = await openDB();
//       const bodyData = await loadLatestBodyFromSQLite(db, userId);
//       console.log("🔄 Loaded body data for userId:", userId, bodyData);
//       dispatch({ type: 'SET_BODY_DATA', payload: bodyData });
//     } catch (error) {
//       console.error('Error loading body data:', error);
//       dispatch({ type: 'SET_BODY_DATA', payload: null });
//     }
//   };