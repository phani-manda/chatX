import { useState } from "react";
import { X, Users, Image as ImageIcon, Loader2 } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useChatStore } from "../store/useChatStore";

const CreateGroupModal = ({ isOpen, onClose }) => {
  const [groupName, setGroupName] = useState("");
  const [groupDescription, setGroupDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createGroup } = useGroupStore();
  const { contacts } = useChatStore();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatarPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const toggleMember = (userId) => {
    setSelectedMembers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!groupName.trim()) {
      return;
    }

    if (selectedMembers.length < 2) {
      return;
    }

    setIsSubmitting(true);
    try {
      await createGroup({
        name: groupName.trim(),
        description: groupDescription.trim(),
        members: selectedMembers,
        avatar: avatarPreview,
      });
      
      // Reset form
      setGroupName("");
      setGroupDescription("");
      setSelectedMembers([]);
      setAvatarPreview(null);
      onClose();
    } catch (error) {
      console.error("Failed to create group:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-md bg-base-100 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-base-300">
          <h2 className="text-lg sm:text-xl font-semibold">Create New Group</h2>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
            disabled={isSubmitting}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Avatar Upload */}
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-24 h-24 rounded-full border-2 border-base-300 flex items-center justify-center overflow-hidden bg-base-200">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt="Group avatar"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Users className="size-10 text-base-content/40" />
                )}
              </div>
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 btn btn-circle btn-sm btn-primary cursor-pointer"
              >
                <ImageIcon className="size-4" />
              </label>
              <input
                type="file"
                id="avatar-upload"
                className="hidden"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Group Name */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Group Name *</span>
            </label>
            <input
              type="text"
              placeholder="Enter group name"
              className="input input-bordered w-full"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              maxLength={100}
              required
              disabled={isSubmitting}
            />
          </div>

          {/* Group Description */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">Description (Optional)</span>
            </label>
            <textarea
              placeholder="Enter group description"
              className="textarea textarea-bordered w-full"
              value={groupDescription}
              onChange={(e) => setGroupDescription(e.target.value)}
              maxLength={500}
              rows={3}
              disabled={isSubmitting}
            />
          </div>

          {/* Members Selection */}
          <div className="form-control">
            <label className="label">
              <span className="label-text">
                Select Members * (Min 2 selected: {selectedMembers.length})
              </span>
            </label>
            <div className="border border-base-300 rounded-lg max-h-48 overflow-y-auto">
              {contacts.length === 0 ? (
                <div className="p-4 text-center text-base-content/60">
                  No contacts available
                </div>
              ) : (
                contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="flex items-center gap-3 p-3 hover:bg-base-200 cursor-pointer"
                    onClick={() => toggleMember(contact._id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedMembers.includes(contact._id)}
                      onChange={() => toggleMember(contact._id)}
                      className="checkbox checkbox-primary checkbox-sm"
                      disabled={isSubmitting}
                    />
                    <img
                      src={contact.profilePic || "/avatar.png"}
                      alt={contact.username}
                      className="size-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{contact.username}</p>
                      <p className="text-sm text-base-content/60 truncate">
                        {contact.email}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary flex-1"
              disabled={isSubmitting || !groupName.trim() || selectedMembers.length < 2}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Group"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateGroupModal;
