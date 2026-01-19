import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  conversations: [],
  currentConversationId: null,
};

const ConversationSlice = createSlice({
  name: "conversation",
  initialState,
  reducers: {
    setConversations(state, action) {
      state.conversations = action.payload;
    },

    setCurrentConversation(state, action) {
      state.currentConversationId = action.payload;
    },

    updateLastMessage(state, action) {
      const { conversationId, lastMessage, lastMessageSender } = action.payload;

      const convo = state.conversations.find(
        (c) => c._id === conversationId
      );

      if (convo) {
        convo.lastMessage = lastMessage;
        convo.lastMessageSender = lastMessageSender;
        convo.updatedAt = new Date().toISOString();
      }
    },

    resetConversationState() {
      return initialState;
    },
  },
});

export const {
  setConversations,
  setCurrentConversation,
  updateLastMessage,
  resetConversationState,
} = ConversationSlice.actions;

export default ConversationSlice.reducer;
