import React from 'react'
import '../styles/DashBoardContent.css'
import { Route, Routes } from 'react-router-dom'
import Navbar from './Navbar'
import Modules from './Modules'
import MediaLibrary from './MediaLibrary'
import UploadMedia from './UploadMedia'

const DashBoardContent = () => {
  return (
    <div className='dashboard-content-container'>
        <div className='dashboard-content-wrapper'>
            <Routes>
              <Route path='modules' element={<Modules/>}/>
              <Route path='library' element={<MediaLibrary/>}/>
              <Route path='upload-media' element={<UploadMedia/>}/>
            </Routes>
        </div>
    </div>
  )
}

export default DashBoardContent