import React, { useEffect } from 'react'
import Header from '../components/Header'
import '../styles/DashBoardPage.css'
import { useDispatch, useSelector } from 'react-redux'
import { restaurantSlugThunk } from '../thunks/loginThunk'
import DashBoardContent from '../components/DashBoardContent'


const DashBoardPage = () => {

  const dispatch = useDispatch()
  const {data} = useSelector(state => state.slug)
  const locationId = useSelector(state => state.auth?.data?.locationId)

  useEffect(() => {

    if(!data && locationId){
      dispatch(restaurantSlugThunk(locationId))
    }

  },[])

  return (
    <div className='dashboard-container'>
        <Header restaurantDetails = {data}/>
        <DashBoardContent/>
    </div>
  )
}

export default DashBoardPage