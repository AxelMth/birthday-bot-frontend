"use client"

import { useState, useEffect } from "react"
import { Search, Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { apiClient } from "@/lib/api-client"
import type { Person } from "@/lib/types"
import Link from "next/link"


export default function DashboardPage() {
  const [people, setPeople] = useState<Person[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [connectionError, setConnectionError] = useState(false)
  const pageSize = 10

  const fetchPeople = async (page: number, searchTerm?: string) => {
    try {
      setLoading(true)
      setConnectionError(false)
      const response = await apiClient.getPaginatedPeople({ query: { pageNumber: page, pageSize: pageSize, ...(searchTerm ? { search: searchTerm } : {}) } })
      if (response.status === 200) {
        console.log(response.body)
        setPeople(response.body.people?.map((person) => ({
          id: person.id ?? 0,
          name: person.name ?? "",
          birthdate: person.birthdate ?? new Date(),
          application: person.application ?? "",
          metadata: person.metadata ?? {},
          communications: [{
            application: person.application ?? "",
            metadata: person.metadata ?? {},
          }]
        })) as Person[])
        setTotalPages(Math.ceil((response.body.count ?? 0) / pageSize))
        setTotal(response.body.count ?? 0)
        setCurrentPage(page)
      } else {
        setConnectionError(true)
        setPeople([])
        setTotal(0)
        setTotalPages(1)
      }
    } catch (error) {
      console.error("Failed to fetch people:", error)
      setConnectionError(true)
      setPeople([])
      setTotal(0)
      setTotalPages(1)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPeople(currentPage, search)
  }, [currentPage, search])

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (id: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette personne ?")) {
      return
    }

    try {
      // await apiClient.deletePersonById({ id })
      const response = await apiClient.getPaginatedPeople({ query: { pageNumber: currentPage, pageSize: 10, search } })
      console.log(response)
    } catch (error) {
      console.error("Failed to delete person:", error)
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR")
  }

  const getApplicationBadge = (application: string) => {
    switch (application.toLowerCase()) {
      case "slack":
        return <Badge variant="secondary">Slack</Badge>
      case "none":
        return <Badge variant="outline">Aucune application</Badge>
      default:
        return <Badge variant="outline">{application}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Tableau de bord</h1>
        <p className="text-muted-foreground mt-1">Gérez les anniversaires et notifications ({total} personnes)</p>
      </div>

      {/* Search and create button */}
      <div className="flex gap-4 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Rechercher par nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Link href="/person/create">
          <Button size="default" className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer whitespace-nowrap">
            <Plus className="w-4 h-4 mr-2" />
            Créer une personne
          </Button>
        </Link>
      </div>

      {/* People Table */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des personnes</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : connectionError ? (
            <div className="text-center py-8 space-y-4">
              <div className="text-destructive">
                <h3 className="font-semibold">Erreur de connexion</h3>
                <p className="text-sm mt-1">Impossible de se connecter au serveur API.</p>
              </div>
              <div className="text-xs text-muted-foreground space-y-1">
                <p>Vérifiez que :</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>La variable d&apos;environnement NEXT_PUBLIC_SERVER_URL est configurée</li>
                  <li>Le serveur backend est en cours d&apos;exécution</li>
                  <li>L&apos;URL du serveur est accessible</li>
                </ul>
              </div>
              <Button variant="outline" onClick={() => {
                fetchPeople(currentPage, search)
              }} className="cursor-pointer">
                Réessayer
              </Button>
            </div>
          ) : people.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {search ? "Aucune personne trouvée pour cette recherche." : "Aucune personne enregistrée."}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Date d&apos;anniversaire</TableHead>
                    <TableHead>Application</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {people.map((person) => (
                    <TableRow key={person.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{person.name}</TableCell>
                      <TableCell>{formatDate(person.birthdate)}</TableCell>
                      <TableCell>{getApplicationBadge(person.application)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/person/${person.id}/edit`}>
                            <Button variant="outline" size="sm" className="cursor-pointer">
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
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} sur {totalPages} ({total} résultats)
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        fetchPeople(currentPage - 1, search)
                      }}
                      disabled={currentPage === 1}
                      className="cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" />
                      Précédent
                    </Button>

                    {/* Page numbers */}
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const pageNum = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i
                        return (
                          <Button
                            key={pageNum}
                            variant={pageNum === currentPage ? "default" : "outline"}
                            size="sm"
                            onClick={() => {
                              fetchPeople(pageNum, search)
                            }}
                            className="w-8 h-8 p-0 cursor-pointer"
                          >
                            {pageNum}
                          </Button>
                        )
                      })}
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchPeople(currentPage + 1, search)}
                      disabled={currentPage === totalPages}
                      className="cursor-pointer"
                    >
                      Suivant
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
