import { combineReducers } from "redux";
import loginSlice from "../slices/LoginSlice";
import errorToastSlice from '../slices/ErrorToastSlice';
import restaurantSlugSlice from '../slices/RestaurantSlugSlice';
import moduleSlice from '../slices/ModuleSlice';
import mediaLibrarySlice from '../slices/MediaLibrarySlice';
import uploadMediaSlice from '../slices/UploadMediaSlice';
import deleteMediaSlice from '../slices/DeleteMediaSlice';
import spotlightSlice from '../slices/SpotLightSlice';


const rootReducer = combineReducers({
    auth : loginSlice,
    errorToast : errorToastSlice,
    slug : restaurantSlugSlice,
    modules : moduleSlice,
    mediaLibrary : mediaLibrarySlice,
    uploadMedia : uploadMediaSlice,
    deleteMedia : deleteMediaSlice,
    spotlight : spotlightSlice
})

export default rootReducer