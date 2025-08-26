import type React from "react";

interface TableContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface TableWrapProps {
  children: React.ReactNode;
  className?: string;
}

export function TableContainer({
  children,
  className = "",
}: TableContainerProps) {
  return <div className={`table-wrap ${className}`}>{children}</div>;
}

export function StandardTable({ children, className = "" }: TableWrapProps) {
  return <table className={`table ${className}`}>{children}</table>;
}
