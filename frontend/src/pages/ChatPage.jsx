import { useChatStore } from "../store/useChatStore";
import { useGroupStore } from "../store/useGroupStore";
import NoConversationPlaceholder from "../components/NoConversationPlaceHolder";
import BorderAnimatedContainer from "../components/BorderAnimatedContainer";
import ProfileHeader from "../components/ProfileHeader";
import ActiveTabSwitch from "../components/ActiveTabSwitch";
import ChatsList from "../components/ChatsList";
import ContactList from "../components/ContactList";
import GroupList from "../components/GroupList";
import ChatContainer from "../components/ChatContainer";
import GroupChatContainer from "../components/GroupChatContainer";

function ChatPage() {
  const { activeTab, selectedUser } = useChatStore();
  const { selectedGroup } = useGroupStore();

  return (
    <div className="flex items-center justify-center min-h-screen w-full p-2 sm:p-4">
      <div className="w-full max-w-[1090px] h-[100vh] sm:h-[90vh] max-h-[750px]">
        <BorderAnimatedContainer>
          <div className="w-full h-full flex bg-slate-900 rounded-xl overflow-hidden">
            {/* LEFT SIDE - Hidden on mobile when chat/group is selected */}
            <div className={`${selectedUser || selectedGroup ? 'hidden' : 'flex'} md:flex w-full md:w-80 flex-shrink-0 bg-slate-800/50 backdrop-blur-sm flex-col`}>
              <ProfileHeader />
              <ActiveTabSwitch />

              <div className="flex-1 overflow-y-auto p-4 space-y-2">
                {activeTab === "chats" ? (
                  <ChatsList />
                ) : activeTab === "groups" ? (
                  <GroupList />
                ) : (
                  <ContactList />
                )}
              </div>
            </div>

            {/* RIGHT SIDE - Full width on mobile when chat/group is selected */}
            <div className={`${selectedUser || selectedGroup ? 'flex' : 'hidden'} md:flex flex-1 min-w-0 flex-col bg-slate-900/50 backdrop-blur-sm overflow-hidden`}>
              {selectedGroup ? (
                <GroupChatContainer />
              ) : selectedUser ? (
                <ChatContainer />
              ) : (
                <NoConversationPlaceholder />
              )}
            </div>
          </div>
        </BorderAnimatedContainer>
      </div>
    </div>
  );
}
export default ChatPage;