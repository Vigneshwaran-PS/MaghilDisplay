import React from 'react'
import '../styles/DashBoardContent.css'
import { Route, Routes } from 'react-router-dom'
import Navbar from './Navbar'
import Modules from './Modules'
import MediaLibrary from './MediaLibrary'
import UploadMedia from './UploadMedia'
import Spotlight from './Spotlight'
import SpotlightPlayer from './SpotlightPlayer'
import ViewSpotlight from './ViewSpotlight'
import EditSpotlight from './EditSpotlight'

const DashBoardContent = () => {
  return (
    <div className='dashboard-content-container'>
        <div className='dashboard-content-wrapper'>
            <Routes>
              <Route path='modules' element={<Modules/>}/>
              <Route path='library' element={<MediaLibrary/>}/>
              <Route path='upload-media' element={<UploadMedia/>}/>
              <Route path='modules/spotlight/:locationId/:templateId' element={<Spotlight/>}/>
              <Route path='modules/spotlight/player/:displayId' element={<SpotlightPlayer/>}/>
              <Route path='modules/spotlight/view/:displayId' element={<ViewSpotlight/>}/>
              <Route path='modules/spotlight/config' element={<EditSpotlight/>}/>
            </Routes>
        </div>
    </div>
  )
}

export default DashBoardContent