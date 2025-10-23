import { useState } from "react";
import { X, Users, UserPlus, UserMinus, Edit2, LogOut, Save, Image as ImageIcon, Crown, Loader2 } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";

const GroupInfoModal = ({ isOpen, onClose }) => {
  const { selectedGroup, updateGroup, leaveGroup, addGroupMember, removeGroupMember } = useGroupStore();
  const { authUser } = useAuthStore();
  const { contacts } = useChatStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editAvatar, setEditAvatar] = useState(null);
  const [showAddMember, setShowAddMember] = useState(false);

  if (!isOpen || !selectedGroup) return null;

  const isAdmin = selectedGroup.admin === authUser._id;
  const availableContacts = contacts.filter(
    (contact) => !selectedGroup.members.includes(contact._id)
  );

  const handleEdit = () => {
    setEditName(selectedGroup.name);
    setEditDescription(selectedGroup.description || "");
    setEditAvatar(null);
    setIsEditing(true);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setEditAvatar(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!editName.trim()) return;

    setIsUpdating(true);
    try {
      await updateGroup(selectedGroup._id, {
        name: editName.trim(),
        description: editDescription.trim(),
        avatar: editAvatar,
      });
      setIsEditing(false);
      setEditAvatar(null);
    } catch (error) {
      console.error("Failed to update group:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLeave = async () => {
    if (confirm("Are you sure you want to leave this group?")) {
      await leaveGroup(selectedGroup._id);
      onClose();
    }
  };

  const handleAddMember = async (userId) => {
    await addGroupMember(selectedGroup._id, userId);
    setShowAddMember(false);
  };

  const handleRemoveMember = async (userId) => {
    if (confirm("Remove this member from the group?")) {
      await removeGroupMember(selectedGroup._id, userId);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-base-100 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300 sticky top-0 bg-base-100 z-10">
          <h2 className="text-lg sm:text-xl font-semibold">Group Info</h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {/* Group Avatar & Name */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <img
                src={editAvatar || selectedGroup.avatar || "/avatar.png"}
                alt={selectedGroup.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-base-300"
              />
              {isAdmin && isEditing && (
                <label
                  htmlFor="group-avatar-upload"
                  className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary cursor-pointer"
                >
                  <ImageIcon className="size-4" />
                </label>
              )}
              <input
                type="file"
                id="group-avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={!isEditing || isUpdating}
              />
            </div>

            {isEditing ? (
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="input input-bordered w-full text-center text-lg font-semibold"
                maxLength={100}
                disabled={isUpdating}
              />
            ) : (
              <h3 className="text-xl font-semibold">{selectedGroup.name}</h3>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-base-content/60 mb-1 block">Description</label>
            {isEditing ? (
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="textarea textarea-bordered w-full"
                rows={3}
                maxLength={500}
                placeholder="Group description"
                disabled={isUpdating}
              />
            ) : (
              <p className="text-base-content/80">
                {selectedGroup.description || "No description"}
              </p>
            )}
          </div>

          {/* Edit/Save Buttons - Admin Only */}
          {isAdmin && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditAvatar(null);
                    }}
                    className="btn btn-ghost flex-1"
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="btn btn-primary flex-1"
                    disabled={isUpdating || !editName.trim()}
                  >
                    {isUpdating ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="size-5" />
                        Save
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleEdit}
                  className="btn btn-primary w-full"
                >
                  <Edit2 className="size-5" />
                  Edit Group
                </button>
              )}
            </div>
          )}

          {/* Members Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold flex items-center gap-2">
                <Users className="size-5" />
                Members ({selectedGroup.members?.length || 0})
              </h4>
              {isAdmin && !showAddMember && (
                <button
                  onClick={() => setShowAddMember(true)}
                  className="btn btn-sm btn-primary"
                >
                  <UserPlus className="size-4" />
                  Add
                </button>
              )}
            </div>

            {/* Add Member Section */}
            {showAddMember && (
              <div className="mb-3 p-3 bg-base-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Add Member</span>
                  <button
                    onClick={() => setShowAddMember(false)}
                    className="btn btn-xs btn-ghost"
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableContacts.length === 0 ? (
                    <p className="text-sm text-base-content/60 text-center py-2">
                      No available contacts to add
                    </p>
                  ) : (
                    availableContacts.map((contact) => (
                      <div
                        key={contact._id}
                        className="flex items-center gap-2 p-2 hover:bg-base-100 rounded cursor-pointer"
                        onClick={() => handleAddMember(contact._id)}
                      >
                        <img
                          src={contact.profilePic || "/avatar.png"}
                          alt={contact.username}
                          className="size-8 rounded-full object-cover"
                        />
                        <span className="flex-1 text-sm">{contact.username}</span>
                        <UserPlus className="size-4 text-primary" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Members List */}
            <div className="space-y-2">
              {selectedGroup.members?.map((memberId) => {
                const member = contacts.find((c) => c._id === memberId) || {
                  _id: memberId,
                  username: "Unknown User",
                  profilePic: "/avatar.png",
                };
                const isMemberAdmin = selectedGroup.admin === memberId;
                const isCurrentUser = memberId === authUser._id;

                return (
                  <div
                    key={memberId}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-base-200"
                  >
                    <img
                      src={member.profilePic || "/avatar.png"}
                      alt={member.username}
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {member.username}
                        {isCurrentUser && " (You)"}
                      </p>
                      {isMemberAdmin && (
                        <span className="text-xs text-primary flex items-center gap-1">
                          <Crown className="size-3" />
                          Admin
                        </span>
                      )}
                    </div>
                    {isAdmin && !isMemberAdmin && !isCurrentUser && (
                      <button
                        onClick={() => handleRemoveMember(memberId)}
                        className="btn btn-sm btn-ghost btn-circle text-error"
                      >
                        <UserMinus className="size-4" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leave Group Button */}
          {!isAdmin && (
            <button
              onClick={handleLeave}
              className="btn btn-error w-full"
            >
              <LogOut className="size-5" />
              Leave Group
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupInfoModal;
