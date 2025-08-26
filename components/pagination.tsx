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
    <div 
      className="flex-shrink-0 p-4"
      style={{
        background: "var(--surface)",
        borderTop: "1px solid var(--border)",
      }}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div 
          className="text-sm"
          style={{ color: "var(--muted)" }}
        >
          Page {pageNumber} sur {totalPages} ({totalItems} résultats)
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                goToPage(pageNumber - 1);
              }}
              disabled={pageNumber === 1}
              className="cursor-pointer hover:brightness-95"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>

            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum =
                  Math.max(1, Math.min(totalPages - 4, pageNumber - 2)) + i;
                const isCurrentPage = pageNum === pageNumber;
                return (
                  <Button
                    key={pageNum}
                    variant={isCurrentPage ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      goToPage(pageNum);
                    }}
                    className="w-8 h-8 p-0 cursor-pointer hover:brightness-95"
                    style={
                      isCurrentPage
                        ? {
                            backgroundColor: "var(--brand)",
                            color: "var(--brand-contrast)",
                            borderColor: "var(--brand)",
                          }
                        : {
                            borderColor: "var(--border)",
                            backgroundColor: "var(--surface)",
                            color: "var(--text)",
                          }
                    }
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(pageNumber + 1)}
              disabled={pageNumber === totalPages}
              className="cursor-pointer hover:brightness-95"
              style={{
                borderColor: "var(--border)",
                backgroundColor: "var(--surface)",
                color: "var(--text)",
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
