"use client";

import { communicationClient } from "@/lib/api-client";
import { useEffect, useState } from "react";
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

type Communication = {
  id: number;
  personName: string;
  applicationName: string;
  message: string;
  sendAt: Date;
};

export default function CommunicationsPage() {
  const [communications, setCommunications] = useState<Communication[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 50;

  useEffect(() => {
    const fetchCommunications = async () => {
      const response = await communicationClient.getPaginatedCommunications({
        query: {
          pageNumber: 1,
          pageSize: 10,
        },
      });
      if (response.status === 200) {
        console.log(response.body);
        setCommunications(
          response.body?.communications?.map((communication) => ({
            ...communication,
            id: communication.id ?? 0,
            personName: communication.personName ?? "",
            applicationName: communication.applicationName ?? "",
            message: communication.message ?? "",
            sendAt: communication.sendAt ?? new Date(),
          })) ?? [],
        );
        setTotal(response.body?.count ?? 0);
      }
    };
    fetchCommunications();
  }, []);

  return (
    <div className="flex flex-col gap-4">
      <h1>Communications</h1>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Person Name</TableHead>
            <TableHead>Application Name</TableHead>
            <TableHead>Message</TableHead>
            <TableHead>Send At</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {communications.map((communication) => (
            <TableRow key={communication.id}>
              <TableCell>{communication.personName}</TableCell>
              <TableCell>{communication.applicationName}</TableCell>
              <TableCell>{communication.message}</TableCell>
              <TableCell>{communication.sendAt.toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={4}>
              <Pagination
                pageNumber={currentPage}
                pageSize={pageSize}
                totalItems={total}
                goToPage={(page) => setCurrentPage(page)}
              />
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
