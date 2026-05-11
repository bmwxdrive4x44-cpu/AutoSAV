import { CategoryCard } from "./category-card";

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategorySelectorProps {
  categories: Category[];
  selectedCategoryId?: string;
  onSelect: (categoryId: string) => void;
  name?: string;
  required?: boolean;
}

export function CategorySelector({
  categories,
  selectedCategoryId,
  onSelect,
  name = "categoryId",
  required = true,
}: CategorySelectorProps) {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-900">
        Category
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>

      {/* Hidden input for form submission */}
      <input
        type="hidden"
        name={name}
        value={selectedCategoryId || ""}
        required={required}
      />

      {/* Category grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {categories.map((category) => (
          <div key={category.id} onClick={() => onSelect(category.id)}>
            <CategoryCard
              name={category.name}
              slug={category.slug}
              icon={category.icon}
              isSelected={selectedCategoryId === category.id}
            />
          </div>
        ))}
      </div>

      {/* Validation feedback */}
      {required && !selectedCategoryId && (
        <p className="text-xs text-red-600">Please select a category</p>
      )}
    </div>
  );
}

