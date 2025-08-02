import { createSlice } from "@reduxjs/toolkit";
import { loginThunk } from "../thunks/loginThunk";


const loginSlice = createSlice({
    name : 'auth',
    initialState : {
        loading : false,
        error : null,
        data : null,
        isAuthenticated : false
    },
    reducers : {
        closeError : (state) => {
            state.error = null
        },
        logout : (state) => {
            state.data = null;
            state.error = null;
            state.loading = false; 
            state.isAuthenticated = false;
        }
    },
    extraReducers : (builder) => {
        builder
            .addCase(loginThunk.pending, (state) => {
                state.error = null;
                state.loading = true
            })
            .addCase(loginThunk.fulfilled, (state,action) => {
                state.loading = false;

                const payload = action.payload
                if(payload === null || payload.metaDataInfo === null || payload.metaDataInfo.data === null){
                    state.error = payload.metaDataInfo.responseMessage;
                    state.isAuthenticated = false
                    return
                }

                state.data = payload.metaDataInfo.data;
                state.isAuthenticated = true;
            })
            .addCase(loginThunk.rejected, (state) => {
                state.loading = false
                state.error = "Something went wrong. please try again later..."
            })
    }
})

export default loginSlice.reducer
export const {closeError, logout} = loginSlice.actions