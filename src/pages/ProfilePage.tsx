
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import AvatarCreator from "@/components/AvatarCreator";
import { ArrowLeft, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function ProfilePage() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout realizado com sucesso");
      navigate("/auth");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Erro ao fazer logout");
    }
  };
  
  // Push content away from sidebar
  const contentClasses = "ml-[70px] md:ml-[200px] p-4";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={contentClasses}>
        <div className="flex justify-between items-center mb-6">
          <button 
            className="flex items-center text-gray-600 hover:text-recomendify-purple"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft size={20} className="mr-1" />
            <span>Voltar</span>
          </button>
          
          <button 
            className="flex items-center text-gray-600 hover:text-red-500"
            onClick={handleLogout}
          >
            <LogOut size={20} className="mr-1" />
            <span>Sair</span>
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <h2 className="text-xl font-semibold mb-4">Perfil</h2>
          
          <div className="flex flex-col md:flex-row items-center md:items-start">
            <div className="mb-6 md:mb-0 md:mr-6 text-center">
              <img 
                src={profile?.avatar || '/placeholder.svg'} 
                alt="Profile Avatar"
                className="w-32 h-32 rounded-full mb-2"
              />
            </div>
            
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome de usuário
                </label>
                <p className="text-lg font-medium">
                  {profile?.displayName || "Usuário"}
                </p>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <p className="text-gray-800">
                  {profile?.email || "Email não disponível"}
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <AvatarCreator />
      </div>
    </div>
  );
}
