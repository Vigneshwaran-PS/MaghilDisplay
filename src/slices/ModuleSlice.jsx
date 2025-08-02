import { createSlice } from "@reduxjs/toolkit";
import { moduleThunk } from "../thunks/ModulesThunk";


const moduleSlice = createSlice({
    name : 'modules',
    initialState : {
        loading : false,
        error : null,
        data :  null
    },
    reducers :{

    },
    extraReducers : (builder) => {
        builder
            .addCase(moduleThunk.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.data = null;
            })
            .addCase(moduleThunk.fulfilled, (state,action) => {
                state.loading = false;
                state.error = null;
                state.data = action.payload;
            })
            .addCase(moduleThunk.rejected, (state,action) => {
                state.loading = false;
                state.error = action.payload;
                state.data = null;
            })
    }
})

export default moduleSlice.reducer