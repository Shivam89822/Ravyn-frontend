import React, { useEffect, useState } from 'react';
import { useForm } from "react-hook-form";
import "./Sigin.css";
import "./Intropage.css";
import emailjs from 'emailjs-com';
import axios from "axios";
import { setUser, clearUser, updateUser } from '../features/user/UserSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { loginSuccess, logout, authChecked } from '../features/user/AuthSlice';

emailjs.init('ctXygJkKLayqZOPO9');

function Sigin(props) {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [isOtpSended, setOtpSended] = useState(false);
  const [isVerified, setVerified] = useState(false);
  const dispatch=useDispatch();
  
  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm();

  // ✅ Submit function
  const onSubmit = async (data) => {
    delete data.otp 
    try {
      const response = await axios.post("http://localhost:8080/api/auth/register", { user: data });

      if (!response || response.status !== 200) {
        alert("Can't save");
        return;
      }
      alert("Saved successfully!");
      const user=response.data.user
      const token=response.data.token
      user['isVerified']=true;
      localStorage.setItem("token", token);
      console.log(user)
      dispatch(setUser(user))
      dispatch(logout())
      navigate('/Home')
      
           
    } catch (e) {
      const msg = e.response?.data?.error || "Backend error";
      alert(msg);

    }
  };

  // ✅ Send OTP
  const sendotp = async () => {
    setOtpSended(true)
    const isValid = await trigger(["fullName", "userName", "email", "password"]);
    if (!isValid) {
      alert("Enter above fields first");
      return;
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    setOtp(otpCode);

    const templateParams = {
      from_name: watch("userName"),
      from_email: 'no-reply@shivamify.com',
      reply_to: watch("email"),
      passcode: otpCode,
      time: new Date(Date.now() + 15 * 60 * 1000).toLocaleTimeString(),
      email: watch("email"),
    };

    emailjs.send('service_3neomnl', 'template_13gg2qv', templateParams)
      .then(() => {
        // alert(`OTP sent to ${watch("email")}`);
        setOtpSended(true);
      })
      .catch((error) => {
        console.error('Failed to send OTP', error);
        alert('Failed to send OTP');
      });
  };

  // ✅ Verify OTP
  const verifyOtp = async () => {
    const isValid = await trigger(["otp"]);
    if (!isValid) {
      alert("Enter OTP");
      return;
    }

    if (otp === watch("otp")) {
      setVerified(true);
      // alert("OTP Verified ✅");
    } else {
      setVerified(false);
      alert("Wrong OTP ❌");
    }
  };

  useEffect(()=>{
    // const user={isVerified:false}
    // dispatch(setUser(user))
  },[])

  return (
    <div>
      <form className='sign-in-form' onSubmit={handleSubmit(onSubmit)}>
        <div className='headingHolder'>
          <div className='headingHolder-Item'>Join the Vibe!🚀</div>
          <div className='headingHolder-Item is-cross' onClick={()=>{props.setCheckSigin(false)}}>×</div>
        </div>

        {/* Full Name */}
        <div className='sigin-input-box'>
          <input
            placeholder='Fullname'
            className='sigin-inputs'
            {...register("fullName", { required: true })}
          />
        </div>
        {errors.fullName && <div className='submit-error'>It can't be empty...</div>}

        {/* Username */}
        <div className='sigin-input-box'>
          <input
            placeholder='Username'
            className='sigin-inputs'
            {...register("userName", { required: true })}
          />
        </div>
        {errors.userName && <div className='submit-error'>It can't be empty...</div>}

        {/* Email */}
        <div className='sigin-input-box'>
          <input
            placeholder='Email'
            className='sigin-inputs'
            {...register("email", {
              required: true,
              pattern: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
            })}
          />
        </div>
        {errors.email && <div className='submit-error'>Wrong format...</div>}

        {/* Password */}
        <div className='sigin-input-box'>
          <input
            type='password'
            placeholder='Password'
            className='sigin-inputs'
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 8,
                message: "Password must be at least 8 characters",
              },
            })}
          />
        </div>
        {errors.password && <div className='submit-error'>{errors.password.message}</div>}

        {/* Send OTP */}
        <div className='sigin-input-box'>
          <button
            type="button"
            onClick={sendotp}
            disabled={isOtpSended}
            className='create-btn pink-theme-button'
          >
            Send OTP
          </button>
        </div>

        {/* OTP Input */}
        {isOtpSended && (
          <div className='sigin-input-box'>
            <input
              placeholder='Enter OTP'
              className='sigin-inputs'
              {...register("otp", { required: true })}
            />
          </div>
        )}

        {/* Verify OTP */}
        {!isVerified && isOtpSended && (
          <div className='sigin-input-box'>
            <button
              type="button"
              onClick={verifyOtp}
              className='create-btn pink-theme-button'
            >
              Verify
            </button>
          </div>
        )}

        {/* Create Account */}
        {isVerified && (
          <div className='sigin-input-box'>
            <button
              type="submit"
              className='create-btn pink-theme-button'
            >
              Create Account
            </button>
          </div>
        )}

        <div className='have-acc-text'>
          Already have an account? <span onClick={()=>{
            props.setCheckSigin(false)
            props.setCheckLogin(true)
          }}>Sign In</span>
        </div>
      </form>
    </div>
  );
}

export default Sigin;
