
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

// Add TypeScript declaration for the global function
declare global {
  interface Window {
    useTestAccount: () => void;
    fillTestAccount: () => void;
  }
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginAsAdmin } = useAuth();
  const location = useLocation();

  // Check if test login is requested via URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get("test") === "admin") {
      setEmail("admin@gmail.com");
      setPassword("@admin123");
    }
  }, [location]);

  // Function to handle test account login
  window.useTestAccount = () => {
    setEmail("admin@gmail.com");
    setPassword("@admin123");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    try {
      // Special handling for admin account - use direct admin login
      if (email === "admin@gmail.com") {
        console.log("Using direct admin login");
        await loginAsAdmin();
      } else {
        // Normal login flow for non-admin users
        await login(email, password);
      }
    } catch (error: any) {
      console.error("Login form error:", error);
      if (error.message?.includes("Email not confirmed")) {
        toast.error("Por favor, verifique seu email para confirmar sua conta.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-recomendify-purple focus:outline-none"
          placeholder="seu@email.com"
          required
        />
      </div>
      
      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Senha
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
        {isLoading ? "Entrando..." : "Entrar"}
      </button>
    </form>
  );
}
