
import { useNavigate, useLocation } from "react-router-dom";
import { Film, BookOpen, MessageCircle, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useAuth();
  
  const menuItems = [
    {
      name: "Filmes",
      icon: Film,
      path: "/",
      active: location.pathname === "/"
    },
    {
      name: "Livros",
      icon: BookOpen,
      path: "/books",
      active: location.pathname === "/books"
    },
    {
      name: "Chat",
      icon: MessageCircle,
      path: "/chat",
      active: location.pathname === "/chat"
    }
  ];

  return (
    <div className="fixed left-0 top-0 h-full bg-white shadow-md w-[70px] md:w-[200px] flex flex-col">
      {/* Profile section at top */}
      <div 
        className="flex items-center justify-center py-5 cursor-pointer"
        onClick={() => navigate("/profile")}
      >
        {profile?.avatar ? (
          <img 
            src={profile.avatar} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full"
          />
        ) : (
          <User className="w-10 h-10 p-1 bg-recomendify-purple-light rounded-full text-recomendify-purple" />
        )}
      </div>
      
      {/* Add button */}
      <div className="my-2 mx-auto">
        <button 
          className="w-12 h-12 rounded-full bg-recomendify-purple flex items-center justify-center text-white"
          onClick={() => navigate("/suggest")}
        >
          <Plus size={24} />
        </button>
      </div>

      {/* Menu items */}
      <div className="flex flex-col mt-8 gap-4">
        {menuItems.map((item) => (
          <div 
            key={item.name}
            className={cn(
              "flex flex-col md:flex-row items-center justify-center md:justify-start p-3 cursor-pointer transition-colors",
              item.active 
                ? "text-recomendify-purple-dark font-medium" 
                : "text-gray-500 hover:text-recomendify-purple"
            )}
            onClick={() => navigate(item.path)}
          >
            <item.icon className={cn(
              "w-6 h-6",
              item.active && "text-recomendify-purple"
            )} />
            <span className="text-xs md:text-sm md:ml-3 mt-1 md:mt-0">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
