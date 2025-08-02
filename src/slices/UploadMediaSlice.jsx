import { createSlice } from "@reduxjs/toolkit";
import { uploadMediaThunk } from "../thunks/MediaLibraryThunk";


const uploadMediaSlice = createSlice({
    name : 'uploadMedia',
    initialState : {
        loading : false,
        error: null,
        data: null,
    },
    reducers : {

    },
    extraReducers : (builder) => {
        builder
            .addCase(uploadMediaThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.data = null;
            })
            .addCase(uploadMediaThunk.fulfilled, (state,action) => {
                state.data = action.payload;
                state.loading = false;
                state.error = null;
            })
            .addCase(uploadMediaThunk.rejected, (state,action) => {
                state.data = action.payload;
                state.loading = false;
                state.error = null;
            })

    }
})


export default uploadMediaSlice.reducer