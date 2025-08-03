import { createSlice } from "@reduxjs/toolkit";
import { deleteMediaThunk } from "../thunks/MediaLibraryThunk";


const deleteMediaSlice = createSlice({
    name : 'deleteMedia',
    initialState : {
        loading : false,
        error : null,
        data : null,
    },
    reducers : {

    },
    extraReducers : (builder) => {
        builder
            .addCase(deleteMediaThunk.pending, (state)=>{
                state.data = null;
                state.error = null;
                state.loading = true;
            })
            .addCase(deleteMediaThunk.fulfilled, (state,action)=>{
                state.data = action.payload;
                state.error = null;
                state.loading = false;
            })
            .addCase(deleteMediaThunk.rejected, (state, action)=>{
                state.data = null;
                state.error = action.payload;
                state.loading = false;
            })
    }
})


export default deleteMediaSlice.reducer