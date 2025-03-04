import {combineReducers} from "redux";
import loginReducer from "./login";


const allReducer = combineReducers({
    loginReducer
    //Thêm nhiều redecer vào đây
})

export default allReducer;