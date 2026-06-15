import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from './ui/Button';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Helper logic to generate pagination items (e.g., [1, '...', 4, 5, 6, '...', 10])
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const siblingCount = 1; // Number of pages to show on either side of the active page

    // Always show the first page
    pages.push(1);

    const startPage = Math.max(2, page - siblingCount);
    const endPage = Math.min(totalPages - 1, page + siblingCount);

    if (startPage > 2) {
      pages.push('...');
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    if (endPage < totalPages - 1) {
      pages.push('...');
    }

    // Always show the last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
      {/* Contextual Info */}
      <p className="text-sm font-medium text-[var(--text-secondary)]">
        Showing page <span className="text-[var(--text-primary)] font-semibold">{page}</span> of{' '}
        <span className="text-[var(--text-primary)] font-semibold">{totalPages}</span>
      </p>

      {/* Navigation Controls */}
      <div className="flex items-center gap-1.5">
        {/* First Page Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-9 w-9 p-0 hidden sm:flex items-center justify-center rounded-lg"
          disabled={page <= 1}
          onClick={() => onPageChange(1)}
          title="Go to first page"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>

        {/* Previous Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 gap-1 rounded-lg"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline text-xs font-medium">Previous</span>
        </Button>

        {/* Numbered Page Links */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-9 text-center text-sm text-[var(--text-secondary)] select-none"
                >
                  &hellip;
                </span>
              );
            }

            const isCurrent = pageNumber === page;

            return (
              <Button
                key={`page-${pageNumber}`}
                size="sm"
                variant={isCurrent ? 'primary' : 'secondary'}
                className={`h-9 w-9 p-0 text-sm font-medium rounded-lg transition-all ${isCurrent
                  ? 'shadow-sm bg-[var(--primary)] text-white'
                  : 'hover:bg-[var(--bg-hover)]'
                  }`}
                onClick={() => onPageChange(pageNumber as number)}
                aria-current={isCurrent ? 'page' : undefined}
              >
                {pageNumber}
              </Button>
            );
          })}
        </div>

        {/* Next Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-3 gap-1 rounded-lg"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        >
          <span className="hidden sm:inline text-xs font-medium">Next</span>
          <ChevronRight className="h-4 w-4" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="secondary"
          size="sm"
          className="h-9 w-9 p-0 hidden sm:flex items-center justify-center rounded-lg"
          disabled={page >= totalPages}
          onClick={() => onPageChange(totalPages)}
          title="Go to last page"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}