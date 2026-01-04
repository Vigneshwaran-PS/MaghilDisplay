import React from 'react'
import '../styles/DashBoardContent.css'
import { Route, Routes } from 'react-router-dom'
import Modules from './Modules'
import MediaLibrary from './MediaLibrary'
import UploadMedia from './UploadMedia'
import Spotlight from './Spotlight'
import SpotlightPlayer from './SpotlightPlayer'
import ViewSpotlight from './ViewSpotlight'
import EditSpotlight from './EditSpotlight'
import MenuModule from './MenuModule'
import AddEditMenuTemplate from './AddEditMenuTemplate';
import MenuTemplatePreview from './MenuTemplatePreview'

const DashBoardContent = () => {
  return (
    <div className='dashboard-content-container'>
        <div className='dashboard-content-wrapper'>
            <Routes>
              <Route path='modules' element={<Modules/>}/>
              <Route path='library' element={<MediaLibrary/>}/>
              <Route path='upload-media' element={<UploadMedia/>}/>

              {/* Spotlight */}
              <Route path='modules/spotlight/:locationId/:templateId' element={<Spotlight/>}/>
              <Route path='modules/spotlight/player/:displayId' element={<SpotlightPlayer/>}/>
              <Route path='modules/spotlight/view/:displayId' element={<ViewSpotlight/>}/>
              <Route path='modules/spotlight/config' element={<EditSpotlight/>}/>

              {/* Menu */}
              <Route path='modules/menu/:locationId/:templateId' element={<MenuModule/>}/>
              <Route path='modules/menu/config' element={<AddEditMenuTemplate/>}/>
            
            </Routes>
        </div>
    </div>
  )
}

export default DashBoardContent