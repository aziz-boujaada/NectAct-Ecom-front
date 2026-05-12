import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
  onPageChange: (page: number) => void;
}

export function PaginationControls({
  currentPage,
  totalPages,
  onPrevious,
  onNext,
  onPageChange,
}: PaginationControlsProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination-controls">
      <button onClick={onPrevious} disabled={currentPage === 1} type="button" aria-label="Previous page">
        <ChevronLeft size={16} />
      </button>

      <div className="pagination-info">
        <span>
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
      </div>

      <div className="pagination-pages">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            disabled={currentPage === page}
            className={`pagination-page ${currentPage === page ? 'active' : ''}`}
            type="button"
          >
            {page}
          </button>
        ))}
      </div>

      <button onClick={onNext} disabled={currentPage === totalPages} type="button" aria-label="Next page">
        <ChevronRight size={16} />
      </button>
    </div>
  );
}
