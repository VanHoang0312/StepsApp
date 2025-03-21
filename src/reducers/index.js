import {combineReducers} from "redux";
import loginReducer from "./login";
import bodyReducer from "./body";


const allReducer = combineReducers({
    loginReducer,
    //bodyReducer
    //Thêm nhiều redecer vào đây
})

export default allReducer;