import { ModuleListPage } from '@/features/ModuleListPage';

export function LibraryPage() {
  return (
    <ModuleListPage
      title="Library"
      description="Manage books, ISBN tracking, and issue/return"
      endpoint="/library/books"
      fields={[
        { key: 'title', label: 'Title', required: true },
        { key: 'author', label: 'Author', required: true },
        { key: 'isbn', label: 'ISBN' },
        { key: 'category', label: 'Category', required: true },
        { key: 'barcode', label: 'Barcode' },
        { key: 'totalCopies', label: 'Total Copies', type: 'number' },
        { key: 'shelfLocation', label: 'Shelf Location' },
      ]}
    />
  );
}
