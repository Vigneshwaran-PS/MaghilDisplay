import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";


const errorToastSlice = createSlice({
    name : 'error-toast',
    initialState : {
        isShowingToast : false,
        message : "",
        backGroundColor : ""
    },
    reducers : {
        showErrorToast : (state,action) => {
            state.message = action.payload.message;
            state.isShowingToast = true;
            state.backGroundColor = action.payload.backGroundColor
        },
        clearErrorToast : (state) => {
            state.message = "";
            state.isShowingToast = false;
            state.backGroundColor = ""
        }
    }
})

export default errorToastSlice.reducer
export const {showErrorToast, clearErrorToast} = errorToastSlice.actions