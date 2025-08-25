"use client";

import { communicationClient } from "@/lib/api-client";
import { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { Header } from "@/components/header";
import { Button } from "@/components/ui/button";

type Communication = {
  id: number;
  personName: string;
  applicationName: string;
  message: string;
  sentAt: Date;
};

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const totalPages = useMemo(() => {
    return Math.ceil(communications.length / pageSize);
  }, [communications, pageSize]);

  const totalItems = useMemo(() => {
    return communications.length;
  }, [communications]);

  const [loading, setLoading] = useState(true);
  const [connectionError, setConnectionError] = useState(false);
  // const [search, setSearch] = useState("");

  const fetchCommunications = async () => {
    setLoading(true);
    setConnectionError(false);
    const response = await communicationClient.getPaginatedCommunications({
      query: {
        pageNumber: currentPage,
        pageSize: pageSize,
        // ...(search ? { search: search } : {}),
      },
    });
    if (response.status === 200) {
      setCommunications(response.body?.communications?.map((communication) => ({
        id: communication.id ?? 0,
        personName: communication.personName ?? "",
        applicationName: communication.applicationName ?? "",
        message: communication.message ?? "",
        sentAt: communication.sentAt ?? new Date(),
      })) ?? []);
      setLoading(false);
    } else {
      setConnectionError(true);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommunications();
  }, [currentPage, pageSize]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Sticky Header and Search */}
      <div className="flex-shrink-0 bg-background border-border">
        <div className="max-w-7xl mx-auto p-4 space-y-4">
          {/* Header */}
          <Header
            title="Communications"
            description={`Gérez les communications (${totalItems} communications)`}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-4 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col">
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
                    fetchCommunications();
                  }}
                  className="cursor-pointer"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : communications.length === 0 ? (
            <div className="flex justify-center items-center flex-1">
              <div className="text-center text-muted-foreground">
                Aucune communication enregistrée.
              </div>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Application</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date d&apos;envoi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {communications.map((communication) => (
                      <TableRow key={communication.id}>
                        <TableCell>{communication.personName}</TableCell>
                        <TableCell>{communication.applicationName}</TableCell>
                        <TableCell>{communication.message}</TableCell>
                        <TableCell>
                          {communication.sentAt.toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                  <TableFooter>
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Pagination
                          pageNumber={currentPage}
                          pageSize={pageSize}
                          totalItems={totalItems}
                          goToPage={(page) => setCurrentPage(page)}
                        />
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          )}    
        </div>
          {/* Sticky Pagination */}
          {totalPages > 1 && (
            <Pagination
              pageNumber={currentPage}
              pageSize={pageSize}
              totalItems={totalItems}
              goToPage={(page) => {
                setCurrentPage(page);
                fetchCommunications();
              }}
            />
          )}
      </div>
    </div>
  );
}
