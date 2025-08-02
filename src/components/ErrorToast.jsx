import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { clearErrorToast } from '../slices/ErrorToastSlice'
import '../styles/ErrorToast.css'
import { closeError } from '../slices/LoginSlice'

const ErrorToast = () => {
    const dispatch = useDispatch()
    const {message, isShowingToast} = useSelector(state => state.errorToast)
    const [show, setShow] = useState(false)

    useEffect(() => {
        if(isShowingToast){
            setTimeout(() => setShow(true), 10)
            
            const timer = setTimeout(() => {
                setShow(false) // Trigger slide-out
                setTimeout(() => dispatch(clearErrorToast()), 500)  
            }, 3000)
            
            dispatch(closeError())
            return () => clearTimeout(timer);
        } else {
            setShow(false)
        }
    },[isShowingToast,dispatch])

    if (!isShowingToast) return null

    return (
        <div className={`error-toast-container ${show ? 'show' : ''}`}>
            <div className="error-toast-wrapper">
                <div className="error-message">
                    {message}
                </div>
                <div className='closer-error-toast'
                    onClick={() => {
                        setShow(false)
                        setTimeout(() => dispatch(clearErrorToast()), 500)
                        dispatch(closeError())
                    }}>
                    &times;
                </div>
            </div>
        </div>
    )
}

export default ErrorToast