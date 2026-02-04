import React from 'react'
import axios from "axios"
import './Sigin.css'
import emailjs from 'emailjs-com';
import { useForm, SubmitHandler } from "react-hook-form"
import { setUser, clearUser, updateUser } from '../features/user/UserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, logout, authChecked } from '../features/user/AuthSlice';


emailjs.init('ctXygJkKLayqZOPO9');
function Login(props) {
const navigate = useNavigate();
const dispatch=useDispatch();
const API_URL = import.meta.env.REACT_APP_API_URL;

     const {
        register,
        handleSubmit,
        watch,
        trigger,
        formState: { errors },
      } = useForm()

  const onSubmit = async(data) =>{
    try{
      const response=await axios.post(` ${API_URL}/api/auth/login`,{
        user:data
      })
      if(!response){
        alert("Response not recived")
      }
      const user=response.data.user
      const token =response.data.token 
      localStorage.setItem('token',token)
      user['isVerified']=true;
      dispatch(setUser(user))
      dispatch(loginSuccess())
      navigate('/Home');
      console.log(" All done ✅")
    }
    catch(e){
      const msg=e.response?.data?.error||"Internal server error"
      alert(msg)
    }
  }
  return (
    <div>
     <form action="" className='sign-in-form' onSubmit={handleSubmit(onSubmit)}>
        <div className='headingHolder'>
          <div className='headingHolder-Item'>Wellcome back👋</div>
          <div className='headingHolder-Item is-cross' onClick={()=>{props.setCheckLogin(false)}}>×</div>
        </div>
        
        <div className='sigin-input-box'>
          <input 
            placeholder='email' 
            className='sigin-inputs' 
            {...register("email", { 
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            })} 
          />
        </div>
        {errors.email && <div className='submit-error'>wrong foramat....</div>}
        <div className='sigin-input-box'>
          <input 
            type='password'
            placeholder='password' 
            className='sigin-inputs' 
            {...register("password", { 
              required: "Password is required", 
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters"
              }
            })} 
          />
        </div>
       
        <div className='sigin-input-box'><button  className='create-btn pink-theme-button' type='submit'>Login</button></div>

        <div className='have-acc-text'>
          Create new account! <span onClick={()=>{
            props.setCheckLogin(false)
            props.setCheckSigin(true)
          }}>Create Account</span>
        </div>
      </form>     
    </div>
  )
}

export default Login
