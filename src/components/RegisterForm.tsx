
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Add TypeScript declaration for the global function
declare global {
  interface Window {
    fillTestAccount: () => void;
  }
}

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { register } = useAuth();

  // Function to pre-fill the admin test account
  const fillTestAccount = () => {
    setEmail("admin@gmail.com");
    setPassword("admin");
    setConfirmPassword("admin");
  };

  // Expose the function to the window for the test button
  useEffect(() => {
    window.fillTestAccount = fillTestAccount;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !confirmPassword) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem");
      return;
    }
    
    if (password.length < 6 && email !== "admin@gmail.com") {
      toast.error("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setIsLoading(true);
    try {
      await register(email, password);
      toast.success("Conta criada com sucesso!");
    } catch (error: any) {
      console.error("Register error:", error);
      if (error.code === "auth/email-already-in-use") {
        toast.error("Este email já está em uso");
      } else if (error.code === "auth/invalid-email") {
        toast.error("Email inválido");
      } else if (error.code === "auth/weak-password") {
        toast.error("Senha muito fraca");
      } else if (error.code === "auth/network-request-failed") {
        toast.error("Erro de conexão. Verifique sua internet.");
      } else {
        toast.error("Erro ao criar conta. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="register-email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="register-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-recomendify-purple focus:outline-none"
          placeholder="seu@email.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="register-password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          id="register-password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-recomendify-purple focus:outline-none"
          placeholder="••••••••"
          required
        />
      </div>
      
      <div>
        <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700">
          Confirmar Senha
        </label>
        <input
          id="confirm-password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-recomendify-purple focus:outline-none"
          placeholder="••••••••"
          required
        />
      </div>
      
      <button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-md bg-recomendify-purple px-4 py-2 text-white font-medium hover:bg-recomendify-purple-dark focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Criando conta..." : "Criar conta"}
      </button>
    </form>
  );
}
