"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface CategoryFilterProps {
  categories: { value: string; label: string; count?: number }[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  className?: string;
}

export function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
  className,
}: CategoryFilterProps) {
  return (
    <div
      className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${className}`}
      role="tablist"
      aria-label="Course categories"
    >
      <Button
        variant={selectedCategory === "all" ? "default" : "outline"}
        size="sm"
        onClick={() => onSelectCategory("all")}
        className="shrink-0"
        role="tab"
        aria-selected={selectedCategory === "all"}
      >
        All
      </Button>

      {categories.map((category) => (
        <Button
          key={category.value}
          variant={selectedCategory === category.value ? "default" : "outline"}
          size="sm"
          onClick={() => onSelectCategory(category.value)}
          className="shrink-0"
          role="tab"
          aria-selected={selectedCategory === category.value}
        >
          {category.label}
          {category.count !== undefined && (
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          )}
        </Button>
      ))}
    </div>
  );
}
