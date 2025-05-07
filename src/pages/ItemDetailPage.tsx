
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMovies, fetchBooks, fetchGames } from "@/services/api";
import { getUserRatingForItem } from "@/services/ratings";
import { useAuth } from "@/context/AuthContext";
import Sidebar from "@/components/Sidebar";
import Rating from "@/components/Rating";
import RatingsList from "@/components/RatingsList";
import { Star, ArrowLeft, Film, BookOpen, Gamepad, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function ItemDetailPage() {
  const { id, type } = useParams<{ id: string; type: string }>();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRating, setUserRating] = useState<any>(null);
  const [refreshRatings, setRefreshRatings] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const determineItemType = () => {
    const path = window.location.pathname;
    if (path.includes('/book/')) return 'book';
    if (path.includes('/movie/')) return 'movie';
    if (path.includes('/game/')) return 'game';
    return 'movie'; // Default fallback
  };
  
  const itemType = determineItemType();
  
  useEffect(() => {
    const fetchItem = async () => {
      if (!id) return;
      
      setLoading(true);
      setError(null);
      let result = null;
      
      try {
        console.log(`Fetching ${itemType} with ID: ${id}`);
        
        switch (itemType) {
          case 'movie':
            const movieResponse = await fetchMovies(`&ids=${id}`);
            result = movieResponse.results[0];
            break;
          case 'book':
            const bookResponse = await fetchBooks(`&q=id:${id}`);
            result = bookResponse.results[0];
            break;
          case 'game':
            const gameResponse = await fetchGames(`&ids=${id}`);
            result = gameResponse.results[0];
            break;
        }
        
        if (!result) {
          setError(`${itemType === 'movie' ? 'Filme' : itemType === 'book' ? 'Livro' : 'Jogo'} não encontrado`);
        } else {
          console.log(`Found ${itemType}:`, result);
          setItem(result);
        }
      } catch (error) {
        console.error(`Error fetching ${itemType}:`, error);
        setError(`Erro ao carregar ${itemType === 'movie' ? 'o filme' : itemType === 'book' ? 'o livro' : 'o jogo'}`);
      } finally {
        setLoading(false);
      }
    };
    
    const fetchUserRating = async () => {
      if (!id || !currentUser) return;
      
      // For Supabase, currentUser.id is the correct property (not uid)
      const rating = await getUserRatingForItem(id);
      setUserRating(rating);
    };
    
    fetchItem();
    fetchUserRating();
  }, [id, itemType, currentUser]);
  
  const handleRatingComplete = () => {
    setRefreshRatings(prev => prev + 1);
    if (currentUser && id) {
      getUserRatingForItem(id)
        .then(rating => setUserRating(rating));
    }
  };
  
  const contentClasses = "ml-[70px] md:ml-[200px] p-4";

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className={contentClasses}>
          <div className="text-center py-10">Carregando...</div>
        </div>
      </div>
    );
  }
  
  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Sidebar />
        <div className={contentClasses}>
          <div className="text-center py-10 text-gray-500">
            {error || "Item não encontrado"}
          </div>
        </div>
      </div>
    );
  }

  const getExternalLinks = () => {
    if (itemType === 'movie') {
      return [
        { name: 'Netflix', url: `https://www.netflix.com/search?q=${encodeURIComponent(item.title)}` },
        { name: 'Amazon Prime', url: `https://www.primevideo.com/search?k=${encodeURIComponent(item.title)}` },
        { name: 'Disney+', url: 'https://www.disneyplus.com' },
        { name: 'HBO Max', url: 'https://play.hbomax.com' }
      ];
    } else if (itemType === 'book') {
      return [
        { name: 'Amazon', url: `https://www.amazon.com.br/s?k=${encodeURIComponent(item.title)}` },
        { name: 'Google Livros', url: `https://books.google.com.br/books?q=${encodeURIComponent(item.title)}` },
        { name: 'Livraria Cultura', url: `https://www3.livrariacultura.com.br/busca/?ft=${encodeURIComponent(item.title)}` }
      ];
    } else if (itemType === 'game') {
      return [
        { name: 'Steam', url: `https://store.steampowered.com/search/?term=${encodeURIComponent(item.title)}` },
        { name: 'Epic Games', url: `https://store.epicgames.com/pt-BR/browse?q=${encodeURIComponent(item.title)}` },
        { name: 'PlayStation Store', url: 'https://store.playstation.com' },
        { name: 'Xbox Store', url: 'https://www.xbox.com/pt-BR/microsoft-store' }
      ];
    }
    return [];
  };

  const externalLinks = getExternalLinks();

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={contentClasses}>
        <button 
          className="flex items-center mb-6 text-gray-600 hover:text-recomendify-purple"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={20} className="mr-1" />
          <span>Voltar</span>
        </button>
        
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 lg:w-1/4 mb-4 md:mb-0">
              <img 
                src={item.image || '/placeholder.svg'} 
                alt={item.title}
                className="w-full rounded-lg shadow-sm object-cover aspect-[2/3]"
              />
            </div>
            
            <div className="md:ml-6 md:w-2/3 lg:w-3/4">
              <div className="flex items-center mb-2">
                <h1 className="text-2xl font-bold">{item.title}</h1>
                <span className="ml-2 flex items-center">
                  {itemType === 'movie' && <Film size={18} className="text-recomendify-purple" />}
                  {itemType === 'book' && <BookOpen size={18} className="text-recomendify-purple" />}
                  {itemType === 'game' && <Gamepad size={18} className="text-recomendify-purple" />}
                </span>
              </div>
              
              {item.releaseDate && (
                <p className="text-gray-600 mb-3">
                  {new Date(item.releaseDate).getFullYear()}
                </p>
              )}
              
              {itemType === 'book' && item.authors && (
                <p className="text-gray-700 mb-3">
                  <span className="font-medium">Autor(es):</span>{" "}
                  {item.authors.join(", ")}
                </p>
              )}
              
              {itemType === 'game' && item.platforms && (
                <p className="text-gray-700 mb-3">
                  <span className="font-medium">Plataformas:</span>{" "}
                  {item.platforms.join(", ")}
                </p>
              )}
              
              {item.description && (
                <div className="mt-4">
                  <h3 className="text-lg font-medium mb-2">Sinopse</h3>
                  <p className="text-gray-700">{item.description}</p>
                </div>
              )}
              
              {externalLinks.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-2">
                    {itemType === 'movie' ? 'Onde Assistir' : 
                     itemType === 'book' ? 'Onde Comprar/Ler' : 
                     'Onde Comprar'}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {externalLinks.map((link, index) => (
                      <a 
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm"
                      >
                        {link.name}
                        <ExternalLink size={14} className="ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {currentUser ? (
          <div className="mb-6">
            <Rating 
              itemId={id || ""} 
              itemType={itemType}
              initialRating={userRating?.rating || 0}
              onRatingComplete={handleRatingComplete}
            />
          </div>
        ) : (
          <div className="bg-white rounded-lg p-4 shadow-sm mb-6 text-center">
            <p className="text-gray-600">
              Faça login para avaliar este {itemType === 'movie' ? 'filme' : itemType === 'book' ? 'livro' : 'jogo'}
            </p>
            <button
              className="mt-2 bg-recomendify-purple text-white px-4 py-2 rounded-md text-sm font-medium"
              onClick={() => navigate('/auth')}
            >
              Entrar
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-sm p-5">
          <RatingsList 
            itemId={id || ""} 
            itemType={itemType}
            refreshTrigger={refreshRatings}
          />
        </div>
      </div>
    </div>
  );
}
