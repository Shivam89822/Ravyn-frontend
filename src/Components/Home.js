import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { setUser, clearUser } from '../features/user/UserSlice'; // Adjust path if needed
import CompleteProfile from './CompleteProfile';
import Loader from './Loader';
import BasePage from './BasePage';
import CreatePost from './CreatePost';

function Home() {
  const user=useSelector((state)=>state.user.user);


  return (
    <div>      
      {user.isFirstLogin&&<CompleteProfile/>} 
      {!user.isFirstLogin&&<BasePage/>}
      


    </div>
  )
}

export default Home
