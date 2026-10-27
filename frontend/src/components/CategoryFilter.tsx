import type { Category } from '../api/types.ts'

type CategoryFilterProps = {
  categories: Category[]
  // null = toutes les catégories.
  selectedId: number | null
  onSelect: (id: number | null) => void
}

// Rangée de puces dans un bac creusé : la puce sélectionnée reste enfoncée (aria-pressed).
export function CategoryFilter({ categories, selectedId, onSelect }: CategoryFilterProps) {
  return (
    <div className="bu-chip-tray is-wrap" role="group" aria-label="Filtrer par catégorie">
      <button type="button" className="bu-chip" aria-pressed={selectedId === null} onClick={() => onSelect(null)}>
        Toutes
      </button>
      {categories.map((category) => (
        <button
          key={category.id}
          type="button"
          className="bu-chip"
          aria-pressed={selectedId === category.id}
          onClick={() => onSelect(category.id)}
        >
          <span className="bu-dot" style={{ '--chip': category.color } as React.CSSProperties} />
          {category.name}
        </button>
      ))}
    </div>
  )
}
