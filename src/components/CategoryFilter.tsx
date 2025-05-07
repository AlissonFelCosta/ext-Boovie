
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Category = {
  id: string;
  name: string;
};

type CategoryFilterProps = {
  categories: Category[];
  selectedCategory: string | null;
  onChange: (categoryId: string | null) => void;
};

export default function CategoryFilter({ 
  categories, 
  selectedCategory, 
  onChange 
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
      {categories.map((category) => (
        <Button
          key={category.id}
          variant="outline"
          size="sm"
          className={cn(
            "rounded-full text-xs whitespace-nowrap",
            selectedCategory === category.id 
              ? "bg-recomendify-purple text-white border-recomendify-purple hover:bg-recomendify-purple-dark hover:text-white" 
              : "bg-white text-gray-700 hover:bg-gray-50"
          )}
          onClick={() => onChange(selectedCategory === category.id ? null : category.id)}
        >
          {category.name}
        </Button>
      ))}
    </div>
  );
};
