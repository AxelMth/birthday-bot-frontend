"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { peopleClient } from "@/lib/api-client";
import Link from "next/link";
import { Pagination } from "@/components/pagination";
import { peopleClientService } from "@/lib/clients/people.client.service";
import { useAuth } from "@/components/auth-context";
import {
  Page,
  PageTitle,
  PageActions,
  PageContent,
  PagePagination,
} from "@/components/layout/page";
import {
  TableContainer,
  StandardTable,
} from "@/components/table/table-container";

type Person = {
  id: number;
  name: string;
  birthDate: Date | null;
  application: string;
  applicationMetadata: Record<string, string | number | boolean>;
};

export default function DashboardPage() {
  const { isAdmin } = useAuth();
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [connectionError, setConnectionError] = useState(false);
  const [sortBy, setSortBy] = useState<"name" | "birthDate" | undefined>(
    undefined,
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const pageSize = 50;

  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  const fetchPeople = useCallback(async () => {
    const { data, error } = await peopleClientService.getPaginatedPeople(
      currentPage,
      pageSize,
      search,
      sortBy,
      sortOrder,
    );
    if (data) {
      setPeople(data.people);
      setTotal(data.count);
    } else if (error) {
      setConnectionError(true);
    }
  }, [currentPage, search, sortBy, sortOrder]);

  useEffect(() => {
    setLoading(true);
    setConnectionError(false);
    fetchPeople();
    setLoading(false);
  }, [currentPage, search, sortBy, sortOrder, fetchPeople]);

  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette personne ?")) {
      return;
    }

    const response = await peopleClient.deletePersonById({ params: { id } });
    if (response.status === 200) {
      fetchPeople();
    } else {
      console.error("Failed to delete person:", response.status);
    }
  };

  const handleSort = (field: "name" | "birthDate") => {
    if (sortBy === field) {
      // Toggle sort order if same field
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      // Set new field and default to ascending
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const getSortIcon = (field: "name" | "birthDate") => {
    if (sortBy !== field) return null;
    return sortOrder === "asc" ? (
      <ChevronUp className="w-4 h-4 inline ml-1" />
    ) : (
      <ChevronDown className="w-4 h-4 inline ml-1" />
    );
  };

  const formatDate = (date: Date | null) => {
    if (date) {
      return new Date(date).toLocaleDateString("fr-FR");
    }
    return "N/A";
  };

  const getApplicationBadge = (application: string) => {
    switch (application.toLowerCase()) {
      case "slack":
        return <Badge variant="secondary">Slack</Badge>;
      case "none":
        return <Badge variant="outline">Aucune application</Badge>;
      default:
        return <Badge variant="outline">{application}</Badge>;
    }
  };

  return (
    <Page>
      <PageTitle>
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
      </PageTitle>

      <PageActions>
          <Input
            placeholder="🔍 Rechercher par nom..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setCurrentPage(1); // Reset pagination to page 1 when searching
            }}
            className="input"
          />
        {isAdmin && (
          <Link href="/person/create">
            <Button
              size="default"
              className="btn btn--primary cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-4 h-4 mr-2" />
              Créer une personne
            </Button>
          </Link>
        )}
      </PageActions>

      <PageContent>
        <TableContainer>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : connectionError ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center space-y-4">
                <div className="text-destructive">
                  <h3 className="font-semibold">Erreur de connexion</h3>
                  <p className="text-sm mt-1">
                    Impossible de se connecter au serveur.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    fetchPeople();
                  }}
                  className="cursor-pointer"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : people.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center text-muted">
                {search
                  ? "Aucune personne trouvée pour cette recherche."
                  : "Aucune personne enregistrée."}
              </div>
            </div>
          ) : (
            <StandardTable>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("name")}
                  >
                    Nom
                    {getSortIcon("name")}
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("birthDate")}
                  >
                    Date d&apos;anniversaire
                    {getSortIcon("birthDate")}
                  </TableHead>
                  <TableHead>Application</TableHead>
                  {isAdmin && (
                    <TableHead className="text-right">Actions</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {people.map((person) => (
                  <TableRow key={person.id}>
                    <TableCell className="font-medium">{person.name}</TableCell>
                    <TableCell>{formatDate(person.birthDate)}</TableCell>
                    <TableCell>
                      {getApplicationBadge(person.application)}
                    </TableCell>
                    {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/person/${person.id}/edit`}>
                            <Button
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(person.id)}
                            className="text-destructive hover:text-destructive-foreground hover:bg-destructive cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </StandardTable>
          )}
        </TableContainer>
      </PageContent>

      <PagePagination>
        {totalPages > 1 && (
          <Pagination
            pageNumber={currentPage}
            pageSize={pageSize}
            totalItems={total}
            goToPage={(page) => {
              setCurrentPage(page);
              fetchPeople();
            }}
          />
        )}
      </PagePagination>
    </Page>
  );
}
