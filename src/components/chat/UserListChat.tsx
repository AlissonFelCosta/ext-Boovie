
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/context/AuthContext";
import { Bot } from "lucide-react";

type UserProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_bot?: boolean;
};

interface UserListChatProps {
  onSelect: (user: UserProfile) => void;
  selectedId?: string;
}

const BOT_USER: UserProfile = {
  id: "bot-assistente-001",
  display_name: "Recomendify Bot",
  email: null,
  avatar_url: "https://api.dicebear.com/7.x/bottts/svg?seed=Bot",
  is_bot: true,
};

export default function UserListChat({ onSelect, selectedId }: UserListChatProps) {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfiles() {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("id, display_name, email, avatar_url")
        .neq("id", currentUser?.id); // exclui ele da lista

      setLoading(false);
      if (error) return;
      const profiles = (data as UserProfile[]) || [];
      setUsers([BOT_USER, ...profiles]);
    }
    fetchProfiles();
    // eslint-disable-next-line
  }, [currentUser]);

  return (
    <aside className="w-full sm:w-64 border-r bg-white p-2 flex-shrink-0 overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 px-2">Conversas</h2>
      {loading ? (
        <div className="px-2 text-gray-400">Carregando usuários...</div>
      ) : users.length === 0 ? (
        <div className="px-2 text-gray-500">Nenhum usuário encontrado</div>
      ) : (
        <ul>
          {users.map((user) => (
            <li
              key={user.id}
              className={`flex items-center gap-3 rounded px-2 py-2 cursor-pointer transition ${
                selectedId === user.id
                  ? "bg-recomendify-purple-light font-medium text-recomendify-purple"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => onSelect(user)}
            >
              <Avatar>
                {user.is_bot ? (
                  <Bot className="w-5 h-5 text-recomendify-purple" />
                ) : user.avatar_url ? (
                  <AvatarImage src={user.avatar_url} alt={user.display_name || ""} />
                ) : (
                  <AvatarFallback>
                    {(user.display_name ?? user.email ?? "U").charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="truncate">
                  {user.display_name || user.email || "Usuário"}
                  {user.is_bot && <span className="ml-1 text-xs text-recomendify-purple">(Bot)</span>}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </aside>
  );
}
