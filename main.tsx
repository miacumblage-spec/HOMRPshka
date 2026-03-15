import { useStore } from './store';
import LoginPage from './components/LoginPage';
import Sidebar from './components/Sidebar';
import ChatView from './components/ChatView';
import AdminPanel from './components/AdminPanel';
import CreateGroupModal from './components/CreateGroupModal';
import CreateChannelModal from './components/CreateChannelModal';
import EditProfileModal from './components/EditProfileModal';
import UserProfileModal from './components/UserProfileModal';
import CreatePollModal from './components/CreatePollModal';
import ForwardPicker from './components/ForwardPicker';
import EditChatModal from './components/EditChatModal';

export default function App() {
  const {
    currentUser,
    showAdmin,
    showCreateGroup,
    showCreateChannel,
    showEditProfile,
    showUserProfile,
    showCreatePoll,
    showForwardPicker,
    showEditChat,
    activeChat,
  } = useStore();

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <div className="h-screen flex bg-gray-950 overflow-hidden">
      {/* Sidebar */}
      <div className={`${activeChat ? 'hidden md:flex' : 'flex'} w-full md:w-[360px] lg:w-[400px] flex-shrink-0`}>
        <Sidebar />
      </div>

      {/* Chat area */}
      <div className={`${activeChat ? 'flex' : 'hidden md:flex'} flex-1 min-w-0`}>
        <ChatView />
      </div>

      {/* Modals */}
      {showAdmin && <AdminPanel />}
      {showCreateGroup && <CreateGroupModal />}
      {showCreateChannel && <CreateChannelModal />}
      {showEditProfile && <EditProfileModal />}
      {showUserProfile && <UserProfileModal />}
      {showCreatePoll && <CreatePollModal />}
      {showForwardPicker && <ForwardPicker />}
      {showEditChat && <EditChatModal />}
    </div>
  );
}
