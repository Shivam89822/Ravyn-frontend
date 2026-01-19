import { configureStore } from '@reduxjs/toolkit'
import userReducer from '../features/user/UserSlice'
import authReducer from "../features/user/AuthSlice";
import activeUserReducer from "../features/user/ActiveUserSlice";
import conversationReducer from "../features/Conversation/ConversationSlice";



export const store = configureStore({
  reducer: {
    user: userReducer,
    auth: authReducer,
    activeUser:activeUserReducer,
    conversations:conversationReducer,
  },
})