
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import UserListChat from "@/components/chat/UserListChat";
import ChatConversation from "@/components/chat/ChatConversation";

export default function ChatPage() {
  const [selectedUser, setSelectedUser] = useState<null | {
    id: string;
    display_name: string | null;
    email: string | null;
    avatar_url: string | null;
  }>(null);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="ml-[70px] md:ml-[200px] flex flex-1 w-full">
        <UserListChat
          onSelect={setSelectedUser}
          selectedId={selectedUser?.id}
        />
        <div className="flex-1 flex flex-col h-[85vh] max-h-[650px] mx-auto my-8 bg-white border shadow rounded-xl overflow-hidden">
          {selectedUser ? (
            <ChatConversation otherUser={selectedUser} />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <span className="text-2xl mb-2">Selecione um usuário para começar a conversar</span>
              <span className="text-sm">Clique em um nome na lista ao lado.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
