import type React from "react";

interface PageProps {
  children: React.ReactNode;
  className?: string;
}

interface PageTitleProps {
  children: React.ReactNode;
  className?: string;
}

interface PageActionsProps {
  children?: React.ReactNode;
  className?: string;
}

interface PageContentProps {
  children: React.ReactNode;
  className?: string;
}

interface PagePaginationProps {
  children?: React.ReactNode;
  className?: string;
}

export function Page({ children, className = "" }: PageProps) {
  return <div className={`container page ${className}`}>{children}</div>;
}

export function PageTitle({ children, className = "" }: PageTitleProps) {
  return <div className={`page__title ${className}`}>{children}</div>;
}

export function PageActions({
  children = null,
  className = "",
}: PageActionsProps) {
  return <div className={`page__actions ${className}`}>{children}</div>;
}

export function PageContent({ children, className = "" }: PageContentProps) {
  return <div className={`page__content ${className}`}>{children}</div>;
}

export function PagePagination({
  children = null,
  className = "",
}: PagePaginationProps) {
  return <div className={`page__pagination ${className}`}>{children}</div>;
}
