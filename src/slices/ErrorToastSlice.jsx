import { createSlice } from "@reduxjs/toolkit";
import { useSelector } from "react-redux";


const errorToastSlice = createSlice({
    name : 'error-toast',
    initialState : {
        isShowingToast : false,
        message : ""
    },
    reducers : {
        showErrorToast : (state,action) => {
            state.message = action.payload,
            state.isShowingToast = true
        },
        clearErrorToast : (state) => {
            state.message = "",
            state.isShowingToast = false
        }
    }
})

export default errorToastSlice.reducer
export const {showErrorToast, clearErrorToast} = errorToastSlice.actions