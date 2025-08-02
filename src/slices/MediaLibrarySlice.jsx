import { createSlice } from "@reduxjs/toolkit";
import { mediaLibraryThunk } from "../thunks/MediaLibraryThunk";


const mediaLibrarySlice = createSlice({
    name : 'mediaLbrary',
    initialState : {
        medias : [],
        error: null,
        loading : false
    },
    reducers : {

    },
    extraReducers : (builder) => {
        builder
            .addCase(mediaLibraryThunk.pending, (state) => {
                state.error = null,
                state.loading = true,
                state.medias = []
            })
            .addCase(mediaLibraryThunk.fulfilled, (state,action) => {
                state.error = null,
                state.loading = false,
                state.medias = action.payload
            })
            .addCase(mediaLibraryThunk.rejected, (state,action) => {
                state.error = action.payload,
                state.loading = false,
                state.medias = []
            })
    }
})


export default mediaLibrarySlice.reducer