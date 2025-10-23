import { useState, useRef, useEffect } from "react";
import { Reply, Trash2, MoreVertical } from "lucide-react";
import { formatMessageTime } from "../lib/utils";

const Message = ({ 
  message, 
  isOwnMessage, 
  onReply, 
  onDelete, 
  showSenderName = false,
  senderInfo = null 
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const sender = senderInfo || message.senderId;

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div className={`flex gap-2 max-w-[80%] ${isOwnMessage ? "flex-row-reverse" : ""}`}>
        {/* Sender Avatar */}
        {!isOwnMessage && sender && (
          <img
            src={sender.profilePic || "/avatar.png"}
            alt={sender.username}
            className="size-8 sm:size-10 rounded-full object-cover shrink-0"
          />
        )}

        {/* Message Content */}
        <div className="flex flex-col">
          {/* Sender Name (only for others' messages in groups) */}
          {!isOwnMessage && showSenderName && sender && (
            <span className="text-xs text-base-content/60 mb-1 ml-1">
              {sender.username}
            </span>
          )}

          {/* Reply Preview */}
          {message.replyTo && (
            <div className="mb-1 ml-1 mr-1">
              <div className={`text-xs p-2 rounded border-l-2 ${
                isOwnMessage 
                  ? "bg-primary/20 border-primary-content/50" 
                  : "bg-base-300 border-base-content/30"
              }`}>
                <div className="flex items-center gap-1 mb-1">
                  <Reply className="size-3" />
                  <span className="font-semibold">
                    {message.replyTo.senderId?.username || "Unknown"}
                  </span>
                </div>
                <p className="truncate opacity-70">
                  {message.replyTo.text || (message.replyTo.image ? "📷 Image" : "Message")}
                </p>
              </div>
            </div>
          )}

          {/* Message Bubble */}
          <div className="relative group">
            <div
              className={`rounded-lg p-3 ${
                isOwnMessage
                  ? "bg-primary text-primary-content"
                  : "bg-base-200"
              } ${message.isOptimistic ? "opacity-60" : ""}`}
            >
              {message.image && (
                <img
                  src={message.image}
                  alt="attachment"
                  className="sm:max-w-[200px] rounded-md mb-2"
                />
              )}
              {message.text && (
                <p className="text-sm sm:text-base break-words">{message.text}</p>
              )}
            </div>

            {/* Message Actions Menu */}
            {!message.isOptimistic && (
              <div className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="btn btn-xs btn-circle btn-ghost"
                >
                  <MoreVertical className="size-4" />
                </button>

                {showMenu && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 mt-1 bg-base-100 rounded-lg shadow-lg border border-base-300 z-10 min-w-[120px]"
                  >
                    <button
                      onClick={() => {
                        onReply(message);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-sm hover:bg-base-200 flex items-center gap-2 rounded-t-lg"
                    >
                      <Reply className="size-4" />
                      Reply
                    </button>
                    {isOwnMessage && onDelete && (
                      <button
                        onClick={() => {
                          onDelete(message._id);
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-sm hover:bg-base-200 flex items-center gap-2 text-error rounded-b-lg"
                      >
                        <Trash2 className="size-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span
            className={`text-xs text-base-content/50 mt-1 ${
              isOwnMessage ? "text-right mr-1" : "ml-1"
            }`}
          >
            {formatMessageTime(message.createdAt)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Message;
