import { createSlice } from "@reduxjs/toolkit";
import { spotLightMediasThunk, spotLightThunk } from "../thunks/SpotLightThunk";


const spotlightSlice = createSlice({
    name : 'spotlight',
    initialState : {
        data : null,
        loading : false,
        error : null,
        displayData : null,
        displayError : null,
        displayLoading : false,
    },
    reducers : {
    },
    extraReducers : (builder) => {
        builder
            .addCase(spotLightThunk.pending, (state)=>{
                state.data = null;
                state.error = null;
                state.loading = true;
                state.displayData = null;
                state.displayError = null;
            })
            .addCase(spotLightThunk.fulfilled, (state,action) => {
                state.data = action.payload;
                state.error = null;
                state.loading = false;
                state.displayData = null;
                state.displayError = null;
            })
            .addCase(spotLightThunk.rejected, (state,action) => {
                state.data = null;
                state.error = action.payload;
                state.loading = false;
                state.displayData = null;
                state.displayError = null;
            })
        builder
            .addCase(spotLightMediasThunk.pending, (state) => {
                state.displayData = null;
                state.displayError = null;
                state.displayLoading = true;
            })
            .addCase(spotLightMediasThunk.fulfilled, (state, action) => {
                state.displayData = action.payload;
                state.displayError = null;
                state.displayLoading = false;
            })
            .addCase(spotLightMediasThunk.rejected, (state, action) => {
                state.displayData = null;
                state.displayError = action.payload;
                state.displayLoading = false;
            });
    }
})


export default spotlightSlice.reducer