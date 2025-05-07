
import { Search } from "lucide-react";
import { useState } from "react";

type SearchBarProps = {
  onSearch: (query: string) => void;
  placeholder?: string;
};

export default function SearchBar({ onSearch, placeholder = "Pesquisar..." }: SearchBarProps) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(query);
  };

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex items-center bg-gray-100 rounded-full px-4 py-2"
    >
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="bg-transparent flex-1 border-none outline-none text-sm"
      />
      <button type="submit" className="text-gray-400 hover:text-recomendify-purple">
        <Search size={18} />
      </button>
    </form>
  );
};
