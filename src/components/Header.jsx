import React, { useState } from 'react'
import '../styles/Header.css'
import { GCP_API } from '../api/api'
import Navbar from './Navbar'

const Header = ({restaurantDetails}) => {

  const [showNavBar, setShowNavBar] = useState(false)

  const handleNavBar = () => {
    setShowNavBar(!showNavBar)
    return
  }

  const getRestaurantLogo = () => {
    const media = restaurantDetails?.media?.[0]
    if(!media){
      return "";
    }

    const mediaId = media?.id
    const mimeType = media?.mimeType.split('/')[1];
    
    return `${GCP_API.defaults.baseURL}/${mediaId}.${mimeType}`
  }


  return (
    <div className='header-container'>
        <div className="header-wrapper">
            <picture className="restaurant-logo">
                <img src={getRestaurantLogo()} alt="" />
            </picture>
            
            <div className="search-bar">
              <input type="text" placeholder='Search...'/>
            </div>
        
            <div className="navbar" id="navbar"
                  onClick={() => handleNavBar()}
            >
                <div className="hamburger" id="hamburger">
                   {
                    !showNavBar
                    ? <>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                        <div className="hamburger-line"></div>
                      </>
                    : <>
                          <div className='close-navbar'>
                              &times;
                          </div>
                      </>  
                   }
                </div>
            </div>

            {
                showNavBar 
                && <Navbar showNavBar={showNavBar} setShowNavBar={setShowNavBar}/> 
            }
        </div>
    </div>
  )
}

export default Header