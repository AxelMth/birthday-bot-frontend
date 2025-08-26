"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
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
import { Header } from "@/components/header";
import { Container } from "@/components/container";
import { peopleClientService } from "@/lib/clients/people.client.service";
import { useAuth } from "@/components/auth-context";

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
    <Container>
      <div className="flex flex-col h-full overflow-hidden">
        <Header
          title="Tableau de bord"
          description={`Gérez les anniversaires et notifications (${total} personnes)`}
        />
        {/* Sticky Header and Search */}
        <div className="flex-shrink-0 bg-background border-b border-border">
          <div className="max-w-7xl mx-auto p-4 space-y-4">
            {/* Search and create button */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Rechercher par nom..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1); // Reset pagination to page 1 when searching
                  }}
                  className="pl-10"
                />
              </div>
              {isAdmin && (
                <Link href="/person/create">
                  <Button
                    size="default"
                    className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer whitespace-nowrap"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Créer une personne
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-4 overflow-hidden">
          <div className="max-w-7xl mx-auto h-full flex flex-col">
            {/* People Table */}
            {loading ? (
              <div className="flex justify-center items-center flex-1">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : connectionError ? (
              <div className="flex justify-center items-center flex-1">
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
              <div className="flex justify-center items-center flex-1">
                <div className="text-center text-muted-foreground">
                  {search
                    ? "Aucune personne trouvée pour cette recherche."
                    : "Aucune personne enregistrée."}
                </div>
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
                <div className="flex-1 overflow-y-auto">
                  <Table className="relative">
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead
                          className="bg-background cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort("name")}
                        >
                          Nom
                          {getSortIcon("name")}
                        </TableHead>
                        <TableHead
                          className="bg-background cursor-pointer hover:bg-muted/50 select-none"
                          onClick={() => handleSort("birthDate")}
                        >
                          Date d&apos;anniversaire
                          {getSortIcon("birthDate")}
                        </TableHead>
                        <TableHead className="bg-background">
                          Application
                        </TableHead>
                        {isAdmin && (
                          <TableHead className="text-right bg-background">
                            Actions
                          </TableHead>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {people.map((person) => (
                        <TableRow key={person.id} className="hover:bg-muted/50">
                          <TableCell className="font-medium">
                            {person.name}
                          </TableCell>
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
                  </Table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sticky Pagination */}
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
      </div>
    </Container>
  );
}
