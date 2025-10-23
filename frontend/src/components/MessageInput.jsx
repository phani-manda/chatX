import React from 'react'
import useKeyBoardSound from '../hooks/useKeyboardSound';
import { ImageIcon, SendIcon, SmileIcon, Reply} from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import toast from 'react-hot-toast';
import { XIcon } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';


function MessageInput({ onSendMessage, replyingTo, onCancelReply, emitTyping }) {
  const {playRandomKeyStrokeSound} = useKeyBoardSound();
  const [text, setText] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const fileInputRef = useRef(null);
  const textInputRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const {sendMessage: sendChatMessage, isSoundEnabled} = useChatStore();

  // Use onSendMessage prop if provided, otherwise use sendChatMessage
  const sendMessageHandler = onSendMessage || sendChatMessage;

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target) &&
        !event.target.closest('button[aria-label="Add emoji"]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if(!text.trim() && !imagePreview) return;
    if(isSoundEnabled) playRandomKeyStrokeSound();

    sendMessageHandler({
      text: text.trim(),
      image: imagePreview,
      replyTo: replyingTo?._id || null,
    });
    setText("");
    setImagePreview("");
    setShowEmojiPicker(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
    if(onCancelReply) onCancelReply();

    // Stop typing indicator
    if(emitTyping) emitTyping(false);
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    if(isSoundEnabled) playRandomKeyStrokeSound();

    // Emit typing indicator
    if (emitTyping) {
      emitTyping(true);
      
      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        emitTyping(false);
      }, 2000);
    }
  };

  const handleEmojiClick = (emojiObject) => {
    const emoji = emojiObject.emoji;
    const cursorPosition = textInputRef.current?.selectionStart || text.length;
    const newText = text.slice(0, cursorPosition) + emoji + text.slice(cursorPosition);
    setText(newText);
    
    // Focus back on input and set cursor position
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        const newPosition = cursorPosition + emoji.length;
        textInputRef.current.setSelectionRange(newPosition, newPosition);
      }
    }, 0);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if(!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const removeImage = () => {
    setImagePreview(null);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };


  return (
    <div className="relative p-2 sm:p-4 border-t border-slate-700/50">
      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div ref={emojiPickerRef} className="absolute bottom-16 sm:bottom-20 left-2 sm:left-4 z-50">
          <EmojiPicker
            onEmojiClick={handleEmojiClick}
            theme="dark"
            emojiStyle="native"
            width={window.innerWidth < 640 ? Math.min(window.innerWidth - 32, 350) : 350}
            height={window.innerWidth < 640 ? 350 : 400}
            searchPlaceHolder="Search emoji..."
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Reply Preview */}
      {replyingTo && (
        <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 bg-base-200 p-2 rounded-lg">
          <div className="flex-1">
            <div className="text-xs text-base-content/60 flex items-center gap-1">
              <Reply className="size-3" />
              Replying to {replyingTo.senderId?.username || "Unknown"}
            </div>
            <p className="text-sm truncate">{replyingTo.text || "📷 Image"}</p>
          </div>
          <button
            onClick={onCancelReply}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <XIcon className="size-4" />
          </button>
        </div>
      )}

      {imagePreview && (
        <div className="max-w-3xl mx-auto mb-2 sm:mb-3 flex items-center">
          <div className="relative">
            <img
              src={imagePreview}
              alt="Preview"
              className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-lg border border-slate-700"
            />
            <button
            onClick={removeImage}
            className="absolute -top-2 -right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-slate-800 flex items-center justify-center text-slate-200 hover:bg-slate-700"
            type="button"
            >
              <XIcon className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSendMessage} className="max-w-3xl mx-auto flex space-x-2 sm:space-x-4">
        <button
          type="button"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          className={`bg-slate-800/50 rounded-lg px-2 sm:px-4 transition-colors ${
            showEmojiPicker ? "text-cyan-500" : "text-slate-400 hover:text-slate-200"
          }`}
          aria-label="Add emoji"
        >
          <SmileIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
        </button>

        <input
          ref={textInputRef}
          type="text"
          value={text}
          onChange={handleTextChange}
          className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-3 sm:px-4 text-sm sm:text-base"
          placeholder="Type your message..."
        />

        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleImageChange}
          className="hidden"
        />

        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`bg-slate-800/50 text-slate-400 hover:text-slate-200 rounded-lg px-2 sm:px-4 transition-colors ${
            imagePreview ? "text-cyan-500" : ""
          }`}
          >
           <ImageIcon className="w-4 h-4 sm:w-5 sm:h-5"/>
        </button>
        <button
          type="submit"
          disabled={!text.trim() && !imagePreview}
          className="bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-lg px-3 sm:px-4 py-2 font-medium hover:from-cyan-600 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <SendIcon className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </form>
    </div>
  )
}

export default MessageInput;