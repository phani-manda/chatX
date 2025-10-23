import React from 'react'
import { useChatStore } from '../store/useChatStore';
import { useAuthStore } from '../store/useAuthStore';
import { useEffect, useRef } from 'react';
import ChatHeader from "./ChatHeader";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import NoChatHistoryPlaceholder from "./NoChatHistoryPlaceholder";
import Message from "./Message";

function ChatContainer() {

  const { 
    selectedUser, 
    getMessagesByUserId, 
    messages, 
    isMessagesLoading, 
    subscribeToMessages, 
    unsubscribeFromMessages,
    deleteMessage,
    isUserTyping,
    replyingTo,
    setReplyingTo,
    emitTyping
  } = useChatStore();
  const  {authUser} = useAuthStore();
  const messageEndRef = useRef(null);


  useEffect(() => {
        getMessagesByUserId(selectedUser._id);
        subscribeToMessages(selectedUser._id);
        return () => {
          unsubscribeFromMessages(selectedUser._id);
        }
    }, [selectedUser?._id, getMessagesByUserId, subscribeToMessages, unsubscribeFromMessages]);

  useEffect(() => {
    if(messageEndRef.current) {
      messageEndRef.current.scrollIntoView({behavior: "smooth"});
    }
  }, [messages]);


  const handleEmitTyping = (isTyping) => {
    if (selectedUser) {
      emitTyping(selectedUser._id, isTyping);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <ChatHeader />
      <div className="flex-1 px-3 sm:px-6 overflow-y-auto py-4 sm:py-8">
        {messages.length > 0 && !isMessagesLoading ? (
          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-6">
            {messages.map((msg) => (
              <Message 
                key={msg._id}
                message={msg}
                isOwnMessage={msg.senderId === authUser._id}
                onReply={setReplyingTo}
                onDelete={deleteMessage}
              />
            ))}
            
            {/* Typing Indicator */}
            {isUserTyping && (
              <div className="flex gap-2">
                <img
                  src={selectedUser.profilePic || "/avatar.png"}
                  alt={selectedUser.username}
                  className="size-8 sm:size-10 rounded-full object-cover shrink-0"
                />
                <div className="bg-base-200 rounded-lg p-3 flex items-center gap-1">
                  <div className="flex gap-1">
                    <div className="size-2 rounded-full bg-base-content/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="size-2 rounded-full bg-base-content/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="size-2 rounded-full bg-base-content/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messageEndRef}/>
          </div>
        ): isMessagesLoading ? <MessagesLoadingSkeleton/> : (
          <NoChatHistoryPlaceholder name = {selectedUser.username} />
        )}
      </div>
      <MessageInput
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        emitTyping={handleEmitTyping}
      />
    </div>
  );
}

export default ChatContainer;