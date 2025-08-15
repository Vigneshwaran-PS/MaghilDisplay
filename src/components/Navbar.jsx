import React from 'react'
import '../styles/Navbar.css'
import { useDispatch, useSelector } from 'react-redux'
import mediaLibrary from '../assets/icons/MediaLibrary.svg'
import uploadMedia from '../assets/icons/UploadMedia.png'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { loginThunk, restaurantSlugThunk } from '../thunks/loginThunk'
import { logout } from '../slices/LoginSlice'

const Navbar = ({showNavBar,setShowNavBar}) => {

  const navigate = useNavigate()
  const dispatch = useDispatch()
  const {data} = useSelector(state => state.slug);

  const getRestaurantBranches = () => {
    const branches =  data?.branch
    return branches;
  }


  const switchBranch = (branch) => {
    localStorage.setItem('selectedLocation',branch.id)
    setShowNavBar(!showNavBar)
    dispatch(restaurantSlugThunk(branch.id))
    navigate('/dashboard/modules')
  }


  const logoutMerchant = () => {
    dispatch(logout())
    navigate('/login')
    localStorage.clear()
    sessionStorage.clear()
  }

  return (
    <div className='navbar-container'>
        <div className='navbar-wrapper'>
            <h3>{data?.branchName}</h3>
            <div className="navbar-content">
                <div className="branches">
                  <h5>Branches</h5>
                  {
                    getRestaurantBranches().map(branch => {
                      return (
                        <div 
                          className={`branch ${data.id === branch.id ? 'active' : ''}`} 
                          key={branch.id}
                          onClick={() => switchBranch(branch)}
                        >
                          <div>{branch?.locationName}</div>
                        </div>
                      )
                    })
                  }
                </div>

                <div className="library">
                  <h5>Library</h5>
                  <ul>
                    <li onClick={()=>setShowNavBar(!showNavBar)}>
                      <NavLink to="/dashboard/library" className="media">
                        <picture>
                          <img src={mediaLibrary} alt="Media Library" />
                        </picture>
                        <div className="library-name">
                          Media Library
                        </div>
                      </NavLink>
                    </li>

                    <li onClick={()=>setShowNavBar(!showNavBar)}>
                      <NavLink to="/dashboard/upload-media" className="media">
                        <picture>
                          <img src={uploadMedia} alt="Upload Media" />
                        </picture>
                        <div className="library-name">
                          Upload Media
                        </div>
                      </NavLink>
                    </li>
                  </ul>
                </div>
            </div>
            <div className="logout"
                onClick={logoutMerchant}
            >
              <button>Logout</button>
            </div>
        </div>
    </div>
  )
}

export default Navbar