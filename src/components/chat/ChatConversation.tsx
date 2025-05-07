
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

type UserProfile = {
  id: string;
  display_name: string | null;
  email: string | null;
  avatar_url: string | null;
  is_bot?: boolean;
};

type Message = {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
  is_bot?: boolean;
};

interface ChatProps {
  otherUser: UserProfile;
}

export default function ChatConversation({ otherUser }: ChatProps) {
  const { currentUser } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Carregar mensagens iniciais
  useEffect(() => {
    let isMounted = true;

    async function fetchMessages() {
      setLoading(true);
      setError(null);

      // Se for bot, usar localStorage ou só memória
      if (otherUser.is_bot) {
        const botMsgs = JSON.parse(localStorage.getItem("chat_bot_history") || "[]");
        setMessages(botMsgs);
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("private_messages")
        .select("*")
        .or(
          `and(sender_id.eq.${currentUser?.id},receiver_id.eq.${otherUser.id}),and(sender_id.eq.${otherUser.id},receiver_id.eq.${currentUser?.id})`
        )
        .order("created_at", { ascending: true });

      if (!isMounted) return;
      setLoading(false);

      if (error) {
        setError("Erro ao carregar mensagens.");
        setMessages([]);
      } else {
        setMessages(data || []);
      }
    }

    fetchMessages();

    // Opcional: Realtime (exceto bot)
    if (!otherUser.is_bot) {
      const channel = supabase
        .channel("msg:" + [currentUser?.id, otherUser.id].sort().join("-"))
        .on("postgres_changes", { event: "*", schema: "public", table: "private_messages" }, (payload) => {
          const msg = payload.new as Message;
          if (
            (msg.sender_id === currentUser?.id && msg.receiver_id === otherUser.id) ||
            (msg.sender_id === otherUser.id && msg.receiver_id === currentUser?.id)
          ) {
            setMessages((m) => {
              if (m.some((mm) => mm.id === msg.id)) return m;
              return [...m, msg].sort((a, b) => a.created_at.localeCompare(b.created_at));
            });
          }
        })
        .subscribe();

      return () => {
        isMounted = false;
        supabase.removeChannel(channel);
      };
    } else {
      return () => {};
    }
    // eslint-disable-next-line
  }, [currentUser?.id, otherUser.id, otherUser.is_bot]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    setError(null);

    // Conversa com Bot
    if (otherUser.is_bot) {
      // Adiciona mensagem do usuário
      const myMsg: Message = {
        id: "LOCAL_" + Date.now(),
        sender_id: currentUser?.id || "anon",
        receiver_id: otherUser.id,
        content: newMsg,
        created_at: new Date().toISOString(),
        read: true,
      };
      const nextMsgs = [...messages, myMsg];
      setMessages(nextMsgs);
      localStorage.setItem("chat_bot_history", JSON.stringify(nextMsgs));
      setNewMsg("");
      // Obtém resposta do bot via edge function
      try {
        const resp = await fetch("/functions/v1/openai-bot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: newMsg }),
        });
        if (!resp.ok) throw new Error("Erro do bot.");
        const data = await resp.json();
        const botMsg: Message = {
          id: "BOT_" + Date.now(),
          sender_id: otherUser.id,
          receiver_id: currentUser?.id || "anon",
          content: data.generatedText ?? "Desculpe, não entendi. Pode perguntar novamente?",
          created_at: new Date().toISOString(),
          read: true,
          is_bot: true,
        };
        const updatedMsgs = [...nextMsgs, botMsg];
        setMessages(updatedMsgs);
        localStorage.setItem("chat_bot_history", JSON.stringify(updatedMsgs));
      } catch (e: any) {
        setError("Erro ao obter resposta do bot.");
      } finally {
        setSending(false);
      }
      return;
    }

    // Conversa normal com usuário real
    const { error } = await supabase.from("private_messages").insert({
      sender_id: currentUser?.id,
      receiver_id: otherUser.id,
      content: newMsg,
    });
    setSending(false);
    if (error) {
      setError("Erro ao enviar mensagem.");
      return;
    }
    setNewMsg("");
  };

  return (
    <div className="flex flex-col h-full">
      <header className="border-b bg-white flex items-center gap-4 px-4 py-3">
        <img
          src={
            otherUser.is_bot
              ? "https://api.dicebear.com/7.x/bottts/svg?seed=Bot"
              : otherUser.avatar_url ?? ""
          }
          alt={otherUser.display_name ?? ""}
          className="w-10 h-10 rounded-full"
        />
        <div>
          <div className="font-semibold text-recomendify-purple">
            {otherUser.display_name ?? otherUser.email}
            {otherUser.is_bot && <span className="ml-2 text-xs text-recomendify-purple">(Bot)</span>}
          </div>
          <div className="text-xs text-gray-400">
            {otherUser.is_bot ? "Assistente automatizado sobre livros e filmes" : "Conversa privada"}
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50">
        {loading ? (
          <div className="text-gray-400 text-sm">Carregando mensagens...</div>
        ) : error ? (
          <div className="text-red-500 text-sm">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-gray-500 text-sm">Nenhuma mensagem ainda!</div>
        ) : (
          <div className="flex flex-col gap-3">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender_id === currentUser?.id ? "justify-end" : "justify-start"}`}>
                <div
                  className={`px-4 py-2 rounded-xl text-sm max-w-xs break-words ${
                    msg.sender_id === currentUser?.id
                      ? "bg-recomendify-purple text-white"
                      : msg.is_bot
                      ? "bg-yellow-100 border text-yellow-800"
                      : "bg-white border text-gray-700"
                  }`}
                  title={new Date(msg.created_at).toLocaleString()}
                >
                  {msg.content}
                  <div className="text-xs text-gray-300 mt-1 text-right">{new Date(msg.created_at).toLocaleTimeString()}</div>
                </div>
              </div>
            ))}
            <div ref={chatBottomRef}></div>
          </div>
        )}
      </div>
      <form
        className="border-t bg-white flex gap-2 p-4"
        onSubmit={e => {
          e.preventDefault();
          handleSend();
        }}
      >
        <Input
          value={newMsg}
          placeholder={otherUser.is_bot ? "Pergunte sobre livros ou filmes..." : "Digite sua mensagem..."}
          onChange={e => setNewMsg(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter" && !e.shiftKey) {
              handleSend();
            }
          }}
          disabled={sending}
        />
        <Button
          type="submit"
          disabled={sending || !newMsg.trim()}
          className="px-3 h-10 flex items-center"
        >
          <Send size={18} className="mr-1" /> Enviar
        </Button>
      </form>
    </div>
  );
}
