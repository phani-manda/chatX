import { useEffect, useState } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import CreateGroupModal from "./CreateGroupModal";

const GroupList = () => {
  const { groups, isGroupsLoading, getUserGroups, setSelectedGroup, selectedGroup } = useGroupStore();
  const { authUser } = useAuthStore();
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    getUserGroups();
  }, [getUserGroups]);

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  if (isGroupsLoading) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="size-5" />
            Groups
          </h2>
        </div>
        <div className="flex items-center justify-center flex-1">
          <Loader2 className="size-6 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-base-300">
          <h2 className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Users className="size-5" />
            Groups ({groups.length})
          </h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn btn-primary btn-sm"
          >
            <Plus className="size-4" />
            <span className="hidden sm:inline">New</span>
          </button>
        </div>

        {/* Groups List */}
        <div className="overflow-y-auto flex-1">
          {groups.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <Users className="size-16 text-base-content/20 mb-3" />
              <p className="text-base-content/60 mb-4">No groups yet</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn btn-primary btn-sm"
              >
                <Plus className="size-4" />
                Create First Group
              </button>
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {groups.map((group) => (
                <div
                  key={group._id}
                  onClick={() => setSelectedGroup(group)}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedGroup?._id === group._id
                      ? "bg-primary/10 border border-primary/20"
                      : "hover:bg-base-200"
                  }`}
                >
                  {/* Group Avatar */}
                  <div className="relative">
                    <img
                      src={group.avatar || "/avatar.png"}
                      alt={group.name}
                      className="size-12 sm:size-14 rounded-full object-cover"
                    />
                    <div className="absolute bottom-0 right-0 bg-base-100 rounded-full p-0.5">
                      <Users className="size-3 text-base-content/60" />
                    </div>
                  </div>

                  {/* Group Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-semibold truncate text-sm sm:text-base">
                        {group.name}
                      </p>
                      {group.updatedAt && (
                        <span className="text-xs text-base-content/50">
                          {formatTime(group.updatedAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs sm:text-sm text-base-content/60 truncate flex-1">
                        {group.lastMessage?.text || group.description || "No messages yet"}
                      </p>
                      <span className="text-xs text-base-content/50 shrink-0">
                        {group.members?.length || 0} members
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </>
  );
};

export default GroupList;
