import { createSlice } from "@reduxjs/toolkit";
import { menuThunk} from "../thunks/MenuThunk";

const menuSlice = createSlice({
    name: 'menu',
    initialState : {
        loading : false,
        data : null,
        error : null,
    },
    reducers : {

    },
    extraReducers : (builder) => {
        builder
            .addCase(menuThunk.pending,(state) => {
                state.error = null
                state.loading = false
            })
            .addCase(menuThunk.fulfilled,(state,action) => {
                state.loading = false;
                state.data = action.payload
            })
            .addCase(menuThunk.rejected,(state,action) => {
                state.data = null;
                state.error = action.payload;
                state.loading = false;
            })
    }
})

export default menuSlice.reducer