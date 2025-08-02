import React, { useEffect, useState } from 'react'
import '../styles/LoginPage.css'
import { useDispatch, useSelector } from 'react-redux'
import maghilLogo from '../assets/logos/MaghilLogo.png'
import eyeOpen from '../../src/assets/icons/Eye_Open.png'
import eyeClose from '../../src/assets/icons/Eye_Close.png'
import { loginThunk, restaurantSlugThunk } from '../thunks/loginThunk'
import { clearErrorToast, showErrorToast } from '../slices/ErrorToastSlice'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {

    const dispatch = useDispatch()
    const {error, data} = useSelector(state => state.auth)
    const isAuthenticated = useSelector(state => state.auth.isAuthenticated)
    const [showPassWord, setShowPassword] = useState(false);
    const navigate = useNavigate();


    const [credential,setCredential] = useState({
        businessName : "",
        userId : "",
        password : "",
        validBusinessName: true,
        validUserId: true,
        validPassword: true,
    })

    useEffect(() => {

        if(error && !isAuthenticated){
            dispatch(clearErrorToast())
            dispatch(showErrorToast(error))
            return
        }

        if(isAuthenticated && data){
            dispatch(restaurantSlugThunk(data.locationId))
            navigate('/dashboard', { replace: true });
        }

    },[error, isAuthenticated])

    const loginUser = () => {
        const isBusinessNameValid = credential.businessName.trim() !== ''
        const isUserIdValid = credential.userId.trim() !== ''
        const isPasswordValid = credential.password.trim() !== ''

        setCredential({
            ...credential,
            validBusinessName: isBusinessNameValid,
            validUserId: isUserIdValid,
            validPassword: isPasswordValid,
        })

        if(!isBusinessNameValid || !isPasswordValid || !isUserIdValid){
            return
        }

        dispatch(loginThunk(credential))
    }

    const handleCredentialsOnChange = (e) => {
        const { name, value } = e.target;
        let filteredValue;

        if (name === "password") {
            filteredValue = value.replace(/\s/g, '');
        } else {
            filteredValue = value.replace(/[^a-zA-Z0-9]/g, '');
        }

        setCredential((prev) => ({
            ...prev,
            [name]: filteredValue,
            validBusinessName: true,
            validUserId: true,
            validPassword: true,
        }));
    };
  

  return (
    <div className='login-container'>
        <div className="login-wrapper">
            <div className="maghil-logo">
                <div className="logo-and-maghil-text">
                    <img src={maghilLogo} alt="" />
                    <h1>Maghil</h1>
                </div>
                <div className="maghil-slogon">
                    MAKE A CUSTOMER, EVERY SALE
                </div>
            </div>

            <div className="login-fields">
                <div className="login-business-name">
                    <label htmlFor="">Enter Business Name</label>
                    <input type="text" 
                            value={credential.businessName}
                            name='businessName'
                            onChange={(e) => handleCredentialsOnChange(e)}
                    />
                    {
                        !credential.validBusinessName &&
                        <div className='login-error-message'>please enter valid business name</div>
                    }
                </div>

                <div className="login-user-id">
                    <label htmlFor="">Enter User ID</label>
                    <input type="text" 
                            value={credential.userId}
                            name='userId'
                            onChange={(e) => handleCredentialsOnChange(e)}
                    />
                    {
                        !credential.validUserId &&
                        <div className='login-error-message'>please enter valid user ID</div>
                    }
                </div>

                <div className="login-user-password">
                    <label htmlFor="">Enter Password</label>
                    <div className='password-and-icon'>
                        <input type={showPassWord ? 'text' : 'password'} 
                                value={credential.password}
                                name='password'
                                onChange={(e) => handleCredentialsOnChange(e)}
                        />
                        <span className='password-eye'
                                onClick={() => setShowPassword(!showPassWord)}
                        >
                            <picture>
                                <img src={showPassWord ? eyeOpen : eyeClose} alt="" />
                            </picture>
                        </span>
                    </div>
                    {
                        !credential.validPassword &&
                        <div className='login-error-message'>please enter valid password</div>
                    }
                </div>

                <div className="login-submit-button">
                    <button onClick={() => loginUser()}>SIGN IN</button>
                </div>
            </div>
        </div>
    </div>
  )
}

export default LoginPage