
import { useState, useEffect } from "react";
import { fetchMovies } from "@/services/api";
import Sidebar from "@/components/Sidebar";
import SearchBar from "@/components/SearchBar";
import ItemCard from "@/components/ItemCard";
import CategoryFilter from "@/components/CategoryFilter";
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

// Sample movie categories (would come from an API in a real app)
const MOVIE_CATEGORIES = [
  { id: "action", name: "Ação" },
  { id: "adventure", name: "Aventura" },
  { id: "comedy", name: "Comédia" },
  { id: "drama", name: "Drama" },
  { id: "horror", name: "Terror" },
  { id: "romance", name: "Romance" },
  { id: "thriller", name: "Suspense" },
  { id: "scifi", name: "Ficção Científica" }
];

export default function MoviesPage() {
  const [movies, setMovies] = useState<any[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const getMovies = async () => {
      setLoading(true);
      const response = await fetchMovies(searchQuery, currentPage);
      setMovies(response.results);
      setTotalPages(response.totalPages);
      setLoading(false);
    };
    
    getMovies();
  }, [searchQuery, currentPage]);
  
  // Apply category filtering
  useEffect(() => {
    if (!selectedCategory) {
      setFilteredMovies(movies);
    } else {
      // In a real app with proper API, we would filter by the actual genre
      // Here we're doing a simple simulation of filtering
      const filtered = movies.filter((movie) => {
        // Check if movie title or description contains the category name
        // This is just a simulation - in a real app we'd use actual category data
        const categoryName = MOVIE_CATEGORIES.find(cat => cat.id === selectedCategory)?.name || "";
        return (
          movie.title.toLowerCase().includes(categoryName.toLowerCase()) ||
          (movie.description && movie.description.toLowerCase().includes(categoryName.toLowerCase()))
        );
      });
      setFilteredMovies(filtered);
    }
  }, [movies, selectedCategory]);
  
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1); // Reset to page 1 when searching
  };
  
  const handleCategoryChange = (categoryId: string | null) => {
    setSelectedCategory(categoryId);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll back to top when changing page
  };
  
  // Generate pagination numbers
  const getPaginationItems = () => {
    const items = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust startPage if endPage is maxed out
    if (endPage === totalPages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink 
            onClick={() => handlePageChange(i)} 
            isActive={currentPage === i}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    return items;
  };
  
  // Push content away from sidebar
  const contentClasses = "ml-[70px] md:ml-[200px] p-4";

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className={contentClasses}>
        <div className="flex items-center mb-6">
          <h1 className="text-2xl font-bold">Filmes</h1>
        </div>
        
        <SearchBar onSearch={handleSearch} placeholder="Buscar filmes..." />
        
        <div className="my-4">
          <CategoryFilter 
            categories={MOVIE_CATEGORIES}
            selectedCategory={selectedCategory}
            onChange={handleCategoryChange}
          />
        </div>
        
        {loading ? (
          <div className="text-center py-10">Carregando filmes...</div>
        ) : filteredMovies.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Nenhum filme encontrado
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
              {filteredMovies.map((movie) => (
                <ItemCard
                  key={movie.id}
                  id={movie.id}
                  title={movie.title}
                  image={movie.image}
                  releaseDate={movie.releaseDate}
                  type="movie"
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <Pagination className="my-8">
                <PaginationContent>
                  {currentPage > 1 && (
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(currentPage - 1)} 
                      />
                    </PaginationItem>
                  )}
                  
                  {getPaginationItems()}
                  
                  {currentPage < totalPages && (
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(currentPage + 1)} 
                      />
                    </PaginationItem>
                  )}
                </PaginationContent>
              </Pagination>
            )}
          </>
        )}
      </div>
    </div>
  );
}
