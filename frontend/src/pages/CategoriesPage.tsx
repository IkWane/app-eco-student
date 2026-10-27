import { useCallback, useEffect, useState } from 'react'
import { ApiError } from '../api/client.ts'
import { deleteCategory } from '../api/categories.ts'
import { listCategories } from '../api/expenses.ts'
import type { Category } from '../api/types.ts'
import { CategoryForm } from '../components/CategoryForm.tsx'
import { ConfirmDialog } from '../components/ConfirmDialog.tsx'
import { Icon } from '../components/Icon.tsx'
import { Notice } from '../components/Notice.tsx'

const errorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error ? error.message : fallback

// Message clair selon le refus de l'API (403 par défaut, 409 utilisée, 404 introuvable).
const deleteErrorMessage = (error: unknown): { title: string; text: string } => {
  if (error instanceof ApiError && error.status === 409) {
    return {
      title: 'Catégorie utilisée',
      text: 'Des dépenses utilisent encore cette catégorie. Change leur catégorie ou supprime-les, puis réessaie.',
    }
  }
  if (error instanceof ApiError && error.status === 403) {
    return { title: 'Suppression impossible', text: 'Les catégories par défaut ne peuvent pas être supprimées.' }
  }
  if (error instanceof ApiError && error.status === 404) {
    return { title: 'Catégorie introuvable', text: 'Elle a peut-être déjà été supprimée. La liste a été rechargée.' }
  }
  return { title: 'Suppression impossible', text: errorMessage(error, 'Impossible de supprimer la catégorie.') }
}

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[] | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [reloadKey, setReloadKey] = useState(0)
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<{ title: string; text: string } | null>(null)

  const reload = useCallback(() => setReloadKey((key) => key + 1), [])

  useEffect(() => {
    const controller = new AbortController()
    listCategories(controller.signal)
      .then((list) => {
        setCategories(list)
        setLoadError(null)
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setLoadError(errorMessage(error, 'Impossible de charger les catégories.'))
      })
    return () => controller.abort()
  }, [reloadKey])

  const confirmDelete = async () => {
    if (!toDelete) return
    setDeleting(true)
    setDeleteError(null)
    try {
      await deleteCategory(toDelete.id)
      reload()
    } catch (error) {
      setDeleteError(deleteErrorMessage(error))
      if (error instanceof ApiError && error.status === 404) reload()
    } finally {
      setDeleting(false)
      setToDelete(null)
    }
  }

  const defaults = (categories ?? []).filter((category) => category.isDefault)
  const personal = (categories ?? []).filter((category) => !category.isDefault)

  return (
    <>
      <header className="page-head">
        <h1 className="title-lg">Catégories</h1>
      </header>

      {loadError ? (
        <Notice tone="danger" title="Données indisponibles">
          {loadError}
        </Notice>
      ) : null}
      {deleteError ? (
        <Notice tone="danger" title={deleteError.title}>
          {deleteError.text}
        </Notice>
      ) : null}

      <CategoryForm onCreated={reload} />

      {categories === null && !loadError ? (
        <p className="bu-muted category-loading" role="status">
          Chargement des catégories…
        </p>
      ) : null}

      {categories !== null ? (
        <section className="bu-list" aria-label="Catégories">
          <header className="bu-list-head">
            <h2 className="bu-list-title">
              <span className="bu-list-badge">
                <Icon name="tag" size={18} />
              </span>
              Mes catégories
              <span className="bu-list-count" aria-label={`${categories.length} catégories`}>
                {categories.length}
              </span>
            </h2>
          </header>
          <ul className="bu-list-items">
            {[...defaults, ...personal].map((category) => (
              <li
                key={category.id}
                className="bu-row"
                style={{ '--chip': category.color } as React.CSSProperties}
              >
                <div className="bu-row-hit">
                  <span className="bu-row-icon" aria-hidden="true">
                    {category.name.charAt(0).toUpperCase()}
                  </span>
                  <span className="bu-row-main">
                    <span className="bu-row-label">{category.name}</span>
                    <span className="bu-row-meta category-meta">
                      <span className="bu-dot" aria-hidden="true" />
                      {category.color}
                    </span>
                  </span>
                  {category.isDefault ? <span className="bu-chip bu-chip-static">Par défaut</span> : <span />}
                </div>
                {category.isDefault ? (
                  <span className="category-del-placeholder" aria-hidden="true" />
                ) : (
                  <button
                    type="button"
                    className="bu-btn bu-btn-ghost bu-btn-sm bu-btn-icon bu-row-del"
                    aria-label={`Supprimer « ${category.name} »`}
                    onClick={() => setToDelete(category)}
                  >
                    <Icon name="trash" size={18} />
                  </button>
                )}
              </li>
            ))}
          </ul>
          {personal.length === 0 ? (
            <p className="bu-muted body-sm category-hint">
              Tu n&apos;as pas encore de catégorie perso : crée-en une avec le formulaire ci-dessus.
            </p>
          ) : null}
        </section>
      ) : null}

      {toDelete ? (
        <ConfirmDialog
          title="Supprimer cette catégorie ?"
          confirmLabel="Supprimer"
          busy={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setToDelete(null)}
        >
          « {toDelete.name} » disparaîtra de tes catégories. Ce n&apos;est possible que si aucune dépense ne
          l&apos;utilise.
        </ConfirmDialog>
      ) : null}
    </>
  )
}
