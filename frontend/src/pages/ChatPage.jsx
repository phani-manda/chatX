import { useChatStore } from "../store/useChatStore";
import NoConversationPlaceholder from "../components/NoConversationPlaceHolder";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import ChatContainer from "../components/ChatContainer";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-4">
      <div className="w-[1090px] h-[750px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex bg-slate-900 rounded-xl overflow-hidden">
            {/* LEFT SIDE */}
            <div className="w-80 flex-shrink-0 bg-slate-800/50 backdrop-blur-sm flex flex-col">
              <ProfileHeader />
              <ActiveTabSwitch />

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeTab === "chats" ? <ChatsList /> : <ContactList />}
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="flex-1 min-w-0 flex flex-col bg-slate-900/50 backdrop-blur-sm overflow-hidden">
              {selectedUser ? <ChatContainer /> : <NoConversationPlaceholder />}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default ChatPage;