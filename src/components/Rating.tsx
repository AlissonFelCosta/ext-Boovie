
import { Star } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { addRating } from "@/services/ratings";
import { toast } from "sonner";

type RatingProps = {
  itemId: string;
  itemType: 'movie' | 'book' | 'game';
  initialRating?: number;
  onRatingComplete?: () => void;
};

export default function Rating({ 
  itemId, 
  itemType, 
  initialRating = 0,
  onRatingComplete
}: RatingProps) {
  const [rating, setRating] = useState(initialRating);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [review, setReview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { currentUser } = useAuth();

  const handleRatingSubmit = async () => {
    if (!currentUser || rating === 0) {
      if (!currentUser) {
        toast.error("Você precisa estar logado para avaliar");
        return;
      }
      if (rating === 0) {
        toast.error("Selecione uma classificação de 1 a 5 estrelas");
        return;
      }
      return;
    }
    
    setIsSubmitting(true);
    try {
      await addRating(
        itemId,
        itemType,
        rating,
        review
      );
      
      toast.success("Avaliação enviada com sucesso!");
      
      if (onRatingComplete) {
        onRatingComplete();
      }
      
      // Reset form
      setReview("");
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast.error("Erro ao enviar avaliação. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm">
      <h3 className="text-lg font-medium mb-3">Sua avaliação</h3>
      
      <div className="flex mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoveredRating(star)}
            onMouseLeave={() => setHoveredRating(0)}
            className="mr-1 focus:outline-none"
          >
            <Star
              size={24}
              className={
                (hoveredRating ? star <= hoveredRating : star <= rating)
                  ? "text-yellow-400 fill-yellow-400"
                  : "text-gray-300"
              }
            />
          </button>
        ))}
      </div>
      
      <textarea
        placeholder="Escreva uma avaliação (opcional)"
        value={review}
        onChange={(e) => setReview(e.target.value)}
        className="w-full p-3 border rounded-md text-sm h-24 focus:outline-none focus:ring-1 focus:ring-recomendify-purple"
      />
      
      <button
        onClick={handleRatingSubmit}
        disabled={!currentUser || rating === 0 || isSubmitting}
        className="mt-3 bg-recomendify-purple hover:bg-recomendify-purple-dark text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Enviando..." : "Enviar avaliação"}
      </button>
    </div>
  );
}
