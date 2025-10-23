import { X, Users, Info, ArrowLeft } from "lucide-react";
import { useGroupStore } from "../store/useGroupStore";
import { useState } from "react";
import GroupInfoModal from "./GroupInfoModal";

const GroupHeader = () => {
  const { selectedGroup, setSelectedGroup } = useGroupStore();
  const [showInfoModal, setShowInfoModal] = useState(false);

  if (!selectedGroup) return null;

  return (
    <>
      <div className="p-2.5 sm:p-3 border-b border-base-300 bg-base-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            {/* Back Button - Mobile Only */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="md:hidden btn btn-sm btn-ghost btn-circle"
            >
              <ArrowLeft className="size-5" />
            </button>

            {/* Group Avatar */}
            <div className="avatar">
              <div className="size-10 sm:size-12 rounded-full">
                <img
                  src={selectedGroup.avatar || "/avatar.png"}
                  alt={selectedGroup.name}
                />
              </div>
            </div>

            {/* Group Info */}
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate text-sm sm:text-base">
                {selectedGroup.name}
              </h3>
              <div className="flex items-center gap-1 text-xs sm:text-sm text-base-content/60">
                <Users className="size-3" />
                <span>{selectedGroup.members?.length || 0} members</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* Info Button */}
            <button
              onClick={() => setShowInfoModal(true)}
              className="btn btn-sm btn-ghost btn-circle"
            >
              <Info className="size-4 sm:size-5" />
            </button>

            {/* Close Button - Desktop Only */}
            <button
              onClick={() => setSelectedGroup(null)}
              className="hidden md:flex btn btn-sm btn-ghost btn-circle"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>
      </div>

      <GroupInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
      />
    </>
  );
};

export default GroupHeader;
