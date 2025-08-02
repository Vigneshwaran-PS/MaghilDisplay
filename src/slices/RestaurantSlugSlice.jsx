import { createSlice } from "@reduxjs/toolkit"
import { restaurantSlugThunk } from "../thunks/loginThunk"


const restaurantSlugSlice = createSlice({
    name : 'slug',
    initialState : {
        loading : false,
        error : null,
        data :  null,
    },
    reducers : {

    },

    extraReducers : (builder) => {
        builder
            .addCase(restaurantSlugThunk.pending, (state) => {
                state.loading = true;
                state.data = null;
                state.error = null;
            })
            .addCase(restaurantSlugThunk.fulfilled, (state,action) => {
                state.loading = false;
                state.error = null
                state.data = action.payload
            })
            .addCase(restaurantSlugThunk.rejected, (state,action) => {
                state.loading = false;
                state.error = null
                state.data = action.payload
            })
    }
})

export default restaurantSlugSlice.reducer