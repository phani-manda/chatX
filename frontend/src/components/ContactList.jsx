import React from 'react'
import { useChatStore } from '../store/useChatStore';
import UsersLoadingSkeleton from './UsersLoadingSkeleton';
import { useEffect } from 'react';

function ContactList() {
  const { getAllContacts, allContacts, setSelectedUser, isUsersLoading} = useChatStore();
  
  useEffect(() => {
    getAllContacts();
  }, [getAllContacts]);

  if(isUsersLoading) return <UsersLoadingSkeleton/>;

  return (
    <>
    {allContacts.map((contact) => (
      <div 
      key={contact._id}
      className="bg-cyn-500/10 p-4 rounded-lg cursor-pointer hover:bg-cyn-500-500/20 transition-colors"
      onClick={() => setSelectedUser(contact)}
      >
        <div className="flex items-center gap-3">
          {/* TODO: FIX THIS ONLINE STATUS AND MAKE IT WORK WITH SOCKET */}
          <div className={`avatar online`}>
            <div className="size-12 rounded-full">
              <img src={contact.profilePic || "avatar.png"} />
            </div>
          </div>
          <h4 className="text-slate-200 font-medium truncate">{contact.username}</h4>
        </div>
      </div>
    ))

    }
      
    </>
  ) 
}

export default ContactList;
