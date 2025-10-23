import { useEffect, useRef, useState } from "react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import GroupHeader from "./GroupHeader";
import MessageInput from "./MessageInput";
import MessagesLoadingSkeleton from "./MessagesLoadingSkeleton";
import Message from "./Message";

const GroupChatContainer = () => {
  const {
    selectedGroup,
    groupMessages,
    isGroupMessagesLoading,
    getGroupMessages,
    sendGroupMessage,
    deleteGroupMessage,
    subscribeToGroupMessages,
    unsubscribeFromGroupMessages,
    typingUsers,
    replyingTo,
    setReplyingTo,
    emitGroupTyping,
  } = useGroupStore();
  const { authUser } = useAuthStore();
  const messageEndRef = useRef(null);

  useEffect(() => {
    if (selectedGroup?._id) {
      getGroupMessages(selectedGroup._id);
    }
  }, [selectedGroup?._id, getGroupMessages]);

  useEffect(() => {
    subscribeToGroupMessages();
    return () => unsubscribeFromGroupMessages();
  }, [selectedGroup?._id, subscribeToGroupMessages, unsubscribeFromGroupMessages]);

  useEffect(() => {
    if (messageEndRef.current && groupMessages) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [groupMessages]);

  const handleSendMessage = async (messageData) => {
    if (!selectedGroup?._id) return;
    await sendGroupMessage(selectedGroup._id, messageData);
  };

  const handleDeleteMessage = async (messageId) => {
    if (!selectedGroup?._id) return;
    await deleteGroupMessage(selectedGroup._id, messageId);
  };

  const handleEmitTyping = (isTyping) => {
    if (selectedGroup) {
      emitGroupTyping(selectedGroup._id, isTyping);
    }
  };

  if (!selectedGroup) {
    return (
      <div className="flex-1 flex items-center justify-center bg-base-100">
        <div className="text-center">
          <p className="text-base-content/60">Select a group to start chatting</p>
        </div>
      </div>
    );
  }

  if (isGroupMessagesLoading) {
    return (
      <div className="flex-1 flex flex-col overflow-auto">
        <GroupHeader />
        <MessagesLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <GroupHeader />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3 sm:space-y-6">
        {groupMessages.map((message) => {
          const isOwnMessage = message.senderId._id === authUser._id;
          return (
            <Message
              key={message._id}
              message={message}
              isOwnMessage={isOwnMessage}
              showSenderName={!isOwnMessage}
              senderInfo={message.senderId}
              onReply={setReplyingTo}
              onDelete={handleDeleteMessage}
            />
          );
        })}

        {/* Group Typing Indicator */}
        {typingUsers.length > 0 && (
          <div className="flex gap-2">
            <div className="bg-base-200 rounded-lg p-3 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="size-2 rounded-full bg-base-content/60 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="size-2 rounded-full bg-base-content/60 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="size-2 rounded-full bg-base-content/60 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
              <span className="text-xs text-base-content/60">
                {typingUsers.length === 1 
                  ? `${typingUsers[0]} is typing...` 
                  : `${typingUsers.length} people are typing...`}
              </span>
            </div>
          </div>
        )}

        <div ref={messageEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput 
        onSendMessage={handleSendMessage}
        replyingTo={replyingTo}
        onCancelReply={() => setReplyingTo(null)}
        emitTyping={handleEmitTyping}
      />
    </div>
  );
};

export default GroupChatContainer;
