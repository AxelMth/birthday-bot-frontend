import { Button } from "./ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

type PaginationProps = {
  pageNumber: number;
  pageSize: number;
  totalItems: number;
  goToPage: (page: number) => void;
};

export const Pagination = ({
  pageNumber,
  pageSize,
  totalItems,
  goToPage,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalItems / pageSize);
  return (
    <div className="flex-shrink-0 bg-background border-t border-border p-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Page {pageNumber} sur {totalPages} ({totalItems} résultats)
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            {pageNumber > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  goToPage(pageNumber - 1);
                }}
                disabled={pageNumber === 1}
                className="cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Précédent
              </Button>
            )}

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, pageNumber - 2)) + i;
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pageNumber ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      goToPage(pageNum);
                    }}
                    className="w-8 h-8 p-0 cursor-pointer"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            {pageNumber < totalPages && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToPage(pageNumber + 1)}
                disabled={pageNumber === totalPages}
                className="cursor-pointer"
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
