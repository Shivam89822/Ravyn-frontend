import React, { useState } from 'react'
import './Intropage.css'
import { Play, Heart, MessageCircle, Share2, Bookmark, TrendingUp, Zap, Users, Sparkles } from 'lucide-react';
import myVideo from '../images/front-video.mp4';
import Sigin from './Sigin';
import Login from './Login';
import { motion } from "framer-motion";
function Intropage(props) {
  const [isLiked,setIsLiked]=useState(false)
  const [isSaved,setIsSaved]=useState(false)
  const [checkSigin,setCheckSigin]=useState(false)
  const [checkLogin,setCheckLogin]=useState(false)

  const boxStyle={
     filter: "blur(5px)",
     pointerEvents: "none"
  }
  return (
    <div className='holder-box'>
        {checkSigin&&<div className='sigin-holder-box'><Sigin checkSigin={checkSigin} setCheckSigin={setCheckSigin} checkLogin={checkLogin} setCheckLogin={setCheckLogin}/></div>}
        
        {checkLogin&&<div className='sigin-holder-box'><Login checkLogin={checkLogin} setCheckLogin={setCheckLogin} checkSigin={checkSigin} setCheckSigin={setCheckSigin}/></div>}
        {checkSigin && console.log("Login popup opened")}
        <div id="Intro-holder" style={checkSigin||checkLogin ? boxStyle : {}}>
            <div className='blob blob-1'></div>
            <div className="blob blob-2"></div>
            <div className="blob blob-3"></div>
            
            <div id="intro-name">
                <div className='intro-name-item'>
                    <div id='amount-user-box'>
                        <Zap id='zap-class'/>
                        <span id="amount-user">10K+ Active Users Daily</span>
                    </div>
                </div>    
                <div className='intro-name-item'>
                 <div><span className='Bolder-front-text'>Enjoy.<br/></span></div> 
                    <div><span className='Bolder-front-text first-bold-text'>Vibe.<br/></span></div>
                    <div><span className='Bolder-front-text second-bold-text'>Repeat.<br/></span></div>
                </div>
                <div className='intro-name-item'>
                    <div className='grey-intro-text'>Swipe through bite-sized lessons. Collab with smart minds. Make</div>
                    <div className='grey-intro-text'>learning addictive. <span className='font-purple'>It's TikTok, but you'll actually pass your exams.</span></div>
                </div>

                <div className='front-numbers intro-name-item'>
                    <div className='numbers-front-items'>
                        <div className='number-holder'>10K+</div>
                        <div className='number-holder-des'>Active User</div>
                    </div>
                    <div className='numbers-front-items'>
                        <div className='number-holder'>1k+</div>
                        <div className='number-holder-des'>Creator</div>
                    </div>
                    <div className='numbers-front-items'>
                        <div className='number-holder'>100k+</div>
                        <div className='number-holder-des'>Videos</div>
                    </div>
                </div>
                <div className='intro-name-item button-holder'>
                    <button  className='theme-button pink-theme-button' onClick={()=>setCheckSigin(true)}>Get Started</button>
                    <button className='theme-button grey-theme-button' onClick={()=>setCheckLogin(true)}>Sigin in</button>
                </div>
                <div className='intro-name-item'>
                    <div className='front-flex-items-box'>
                        <div className='front-flex-items'>
                            <div className='icon-box first-color-theme-pink'>
                                <Play className=""/>
                            </div>
                            <div className='icon-side-textbox'>
                                <div className='bold-item-part'>60-sec Fun</div>
                                <div className='light-item-part'>Quick & digestable</div>
                            </div>
                        </div>

                         <div className='front-flex-items'>
                            <div className='icon-box sec-color-theme-blue'>
                                 <Users className="" />
                            </div>
                            <div className='icon-side-textbox'>
                                <div className='bold-item-part'>Study Squads</div>
                                <div className='light-item-part'>Learn with Friends</div>
                            </div>
                        </div>

                         <div className='front-flex-items'>
                            <div className='icon-box third-color-theme-orange'>
                                <TrendingUp className="" />
                            </div>
                            <div className='icon-side-textbox'>
                                <div className='bold-item-part'>Trending Topics</div>
                                <div className='light-item-part'>Whats hot now</div>
                            </div>
                        </div>

                         <div className='front-flex-items'>
                            <div className='icon-box fourth-color-theme-green'>
                                 <Sparkles className="" />
                            </div>
                            <div className='icon-side-textbox'>
                                <div className='bold-item-part'>AI Personalized</div>
                                <div className='light-item-part'>Just for you</div>
                            </div>
                        </div>             
                    </div>
                </div>
            </div>
            <motion.div drag  dragTransition={{
                        bounceStiffness: 500,
                        bounceDamping: 8
                    }} 
                    dragConstraints={{
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                    }}
                     
                    id="intro-video">
                <div id="phone-frame">
                    <div id='phone-notch'></div>
                    <div id='video-content-box'>
                        <div className='video-holder'>
                            <video 
                                src={myVideo} 
                                autoPlay
                                loop
                                muted
                                style={{ width: '100%',marginTop:"6px" ,objectFit: 'cover', borderRadius:"5px"}}
                            />
                        </div>
                            <div className='side-reel-buttons-box side-reel-buttons-box-first'>
                                <div  className='side-reel-buttons' onClick={()=>{setIsLiked(!isLiked)}}>
                                    {isLiked?<Heart color='red' fill='red' className='inner-reel-icon'/>:<Heart className='inner-reel-icon'/>}       
                                </div>
                                <div className='number-of-actions'>
                                    {isLiked?1501:1500}
                                </div>
                            </div>
                            <div className='side-reel-buttons-box side-reel-buttons-box-sec'>
                                <div  className='side-reel-buttons'><MessageCircle className='inner-reel-icon'/>
                                </div>
                                <div className='number-of-actions'>662</div>
                            </div>
                            <div className='side-reel-buttons-box side-reel-buttons-box-third'>
                                <div  className='side-reel-buttons' onClick={()=>{setIsSaved(!isSaved)}}>
                                    {isSaved? <Bookmark color='lightblue' fill='lightblue' className='inner-reel-icon'/>: <Bookmark className='inner-reel-icon'/>}  
                                </div>
                                <div className='number-of-actions'>Save</div>
                            </div>
                            <div className='side-reel-buttons-box side-reel-buttons-box-fourth'>
                                <div  className='side-reel-buttons'><Share2 className='inner-reel-icon'/>
                                </div>
                                <div className='number-of-actions'>Share</div>
                            </div>
                            <div className="user-info-box">
                               <div className='user-prof-name-follow-holder'>
                                <div className='profile-holder-box user-prof-item'></div>
                                <div className='user-prof-name'>@reelhub</div>
                                <div className='user-prof-follow'><button className='follow-btn'>Follow</button></div>                 
                               </div>
                               <div className='caption-holder'>
                                Amazing facts ❤️
                               </div>
                               <div className='amount-of-views'>
                                423k views
                               </div>
                            </div>

                    </div>

                </div>
            </motion.div>
        </div>
      
    </div>
  )
}

export default Intropage
