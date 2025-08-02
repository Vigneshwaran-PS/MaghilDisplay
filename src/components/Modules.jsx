import React, { useEffect } from 'react'
import '../styles/Modules.css'
import { useDispatch, useSelector } from 'react-redux'
import { moduleThunk } from '../thunks/ModulesThunk'
import spotlightIcon from '../assets/icons/spotlight.png'
import orderModuleIcon from '../assets/icons/OrderModule.png'
import checkInModuleIcon from '../assets/icons/CheckInModule.png'

const Modules = () => {

    const dispatch = useDispatch()
    const locationId = useSelector(state => state.slug?.data?.id)
    const modulesData = useSelector(state => state.modules)


    useEffect(() => {
        if(locationId){
            dispatch(moduleThunk(locationId));
            console.log(modulesData)
        }
    },[locationId])

    console.log(modulesData)


    const getModules = () => {
        if (modulesData?.data && Array.isArray(modulesData.data)) {
            return modulesData.data
                .filter(module => module.isEnabled === 1)
                .sort((a, b) => a.sortOrder - b.sortOrder)
          }
          return [];          
    }

    const getModuleLogo = (module) => {
        if(module && module.templateType){
            if(module.templateType === 'ORDERS') 
                return orderModuleIcon;
            if(module.templateType === 'MEDIA') 
                return spotlightIcon;
            if(module.templateType === 'CHECK_IN') 
                return checkInModuleIcon;
        }
        return orderModuleIcon;
    }
    
  return (
    <div className='module-container'>
        <div className='module-wrapper'>
            <div className="modules-header">
                <h1>Maghil Display</h1>
                <div>Choose your display module</div>
            </div>

            <div className="all-modules">
                {
                    getModules().map(module => {
                        return (
                            <div className={`module ${module.templateType.toLowerCase()}`} key={module.templateType}>
                                <picture>
                                    <img src={getModuleLogo(module)} alt="" />
                                </picture>
                                <h3 className='module-name'>{module.templateName}</h3>
                                <div className="module-content">
                                    {module.content}
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    </div>
  )
}

export default Modules