
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

type ItemCardProps = {
  id: string;
  title: string;
  image: string;
  releaseDate: string;
  type: 'movie' | 'book' | 'game';
};

export default function ItemCard({ id, title, image, releaseDate, type }: ItemCardProps) {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  
  const formattedDate = releaseDate 
    ? new Date(releaseDate).toLocaleDateString('pt-BR')
    : 'Data desconhecida';
  
  // Route based on item type
  const handleClick = () => {
    console.log(`Navigating to ${type}/${id}`);
    switch(type) {
      case 'movie':
        navigate(`/movie/${id}`);
        break;
      case 'book':
        navigate(`/book/${id}`);
        break;
      case 'game':
        navigate(`/game/${id}`);
        break;
    }
  };

  return (
    <div 
      className="bg-white rounded-lg shadow-sm overflow-hidden cursor-pointer transition-transform duration-300 hover:scale-105 hover:shadow-md"
      onClick={handleClick}
    >
      <div className="aspect-[2/3] relative bg-gray-100">
        <img 
          src={imageError ? '/placeholder.svg' : image}
          alt={title}
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
        <div className="absolute top-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
          {type === 'movie' ? 'Filme' : type === 'book' ? 'Livro' : 'Jogo'}
        </div>
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm line-clamp-1">{title}</h3>
        <p className="text-xs text-gray-500 mt-1">{formattedDate}</p>
      </div>
    </div>
  );
}
