import React, { useState } from 'react'
import '../styles/MenuModule.css'
import { useLocation, useNavigate, useParams } from 'react-router-dom'


const MenuModule = () => {

    const navigate = useNavigate();
    const {locationId, templateId} = useParams()

    const editMenuModule = () => {
        navigate("/dashboard/modules/menu/config", { 
            state: {
                locationId,
                templateId
            }});
    }
    
  return (
    <div className='menu-module-container'>
        <div className='add-new-menu-module'
             onClick={() => editMenuModule()}  
        >
            +
        </div>
        <div className="menu-module-wrapper">
            <div className="menu-module-header">
                <h1>Menu's</h1>
            </div>
            <div className="menu-module-content-container">
                
            </div>
        </div>

       
    </div>
  )
}

export default MenuModule