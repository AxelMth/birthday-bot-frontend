"use client";

import { communicationsClientService } from "@/lib/clients/communications.client.service";
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pagination } from "@/components/pagination";
import { Button } from "@/components/ui/button";
import { ApplicationBadge } from "@/components/application-badge";
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

  const fetchCommunications = useCallback(async () => {
    setLoading(true);
    setConnectionError(false);
    const { data, error } = await communicationsClientService.getCommunications(
      currentPage,
      pageSize,
    );
    if (data) {
      setCommunications(data.communications);
    } else if (error) {
      setConnectionError(true);
      setCommunications([]);
    }
    setLoading(false);
  }, [currentPage, pageSize]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  return (
    <Page>
      <PageTitle>
        <h1 className="text-2xl font-bold">Communications</h1>
      </PageTitle>

      <PageActions>
        {/* No search actions for communications currently */}
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
                    fetchCommunications();
                  }}
                  className="cursor-pointer"
                >
                  Réessayer
                </Button>
              </div>
            </div>
          ) : communications.length === 0 ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-center text-muted">
                Aucune communication enregistrée.
              </div>
            </div>
          ) : (
            <StandardTable>
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
                    <TableCell>
                      <ApplicationBadge application={communication.applicationName} />
                    </TableCell>
                    <TableCell>{communication.message}</TableCell>
                    <TableCell>
                      {communication.sentAt.toLocaleDateString()}
                    </TableCell>
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
            totalItems={totalItems}
            goToPage={(page) => {
              setCurrentPage(page);
              fetchCommunications();
            }}
          />
        )}
      </PagePagination>
    </Page>
  );
}
