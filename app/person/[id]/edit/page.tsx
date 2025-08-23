"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { apiClient } from "@/lib/api-client"
import type { Person } from "@/lib/types"
import Link from "next/link"

export default function EditPersonPage() {
  const router = useRouter()
  const params = useParams()
  const personId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [person, setPerson] = useState<Person | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    birthdate: "",
    application: "",
    channelId: "",
    userId: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch person data on component mount
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true)
        const personData = await apiClient.getPersonById({
          params: {
            id: personId,
          },
        })
        if (personData.status === 200) {
          const person = personData.body
          setPerson({
            name: personData.body.name ?? "",
            id: personData.body.id ?? 0,
            birthdate: person.birthdate ?? new Date(),
            application: person.application ?? "",
            metadata: person.metadata ?? {},
            communications: [],
          })

          const channelId = (person.metadata as Record<string, unknown>)?.channelId as string
          const userId = (person.metadata as Record<string, unknown>)?.userId as string

          setFormData({
            name: person.name ?? "",
            birthdate: person.birthdate?.toISOString().split("T")[0] ?? "",
            application: person.application ?? "",
            channelId,
            userId,
          })
        } else {
          setErrors({ fetch: "Erreur lors du chargement des données" })
        }
      } finally {
        setLoading(false)
      }
    }

    if (personId) {
      fetchPerson()
    }
  }, [personId])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.birthdate) {
      newErrors.birthdate = "La date d'anniversaire est requise"
    }

    if (!formData.application) {
      newErrors.application = "L'application est requise"
    }

    if (formData.application === "slack") {
      if (!formData.channelId.trim()) {
        newErrors.channelId = "L'ID du canal est requis pour Slack"
      }
      if (!formData.userId.trim()) {
        newErrors.userId = "L'ID de l'utilisateur est requis pour Slack"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setSubmitting(true)

    try {
      const metadata: Record<string, unknown> = {}

      if (formData.application === "slack") {
        metadata.channelId = formData.channelId
        metadata.userId = formData.userId
      }

      const response = await apiClient.updatePersonById({
        params: {
          id: personId,
        },
        body: {
          name: formData.name.trim(),
          birthdate: new Date(formData.birthdate),
          application: formData.application,
          metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
        },
      })

      if (response.status === 200) {
        router.push("/")
      } else {
        setErrors({ submit: "Erreur lors de la mise à jour de la personne" })
      }
    } finally {
      setSubmitting(false)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Modifier un anniversaire</h1>
            <p className="text-muted-foreground mt-1">Chargement des données...</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Error state
  if (errors.fetch) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Modifier un anniversaire</h1>
            <p className="text-muted-foreground mt-1">Erreur lors du chargement</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <p className="text-destructive">{errors.fetch}</p>
              <Button variant="outline" className="mt-4 bg-transparent" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Modifier un anniversaire</h1>
          <p className="text-muted-foreground mt-1">Modifier les informations de {person?.name}</p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Informations de la personne</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <Label htmlFor="name">Nom *</Label>
              <Input
                id="name"
                type="text"
                placeholder="Entrez le nom complet"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

            {/* Birthdate Field */}
            <div className="space-y-2">
              <Label htmlFor="birthdate">Date d&apos;anniversaire *</Label>
              <Input
                id="birthdate"
                type="date"
                value={formData.birthdate}
                onChange={(e) => handleInputChange("birthdate", e.target.value)}
                className={errors.birthdate ? "border-destructive" : ""}
              />
              {errors.birthdate && <p className="text-sm text-destructive">{errors.birthdate}</p>}
            </div>

            {/* Application Field */}
            <div className="space-y-2">
              <Label htmlFor="application">Application *</Label>
              <Select value={formData.application} onValueChange={(value) => handleInputChange("application", value)}>
                <SelectTrigger className={errors.application ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionnez une application" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="none">Aucune application</SelectItem>
                </SelectContent>
              </Select>
              {errors.application && <p className="text-sm text-destructive">{errors.application}</p>}
            </div>

            {/* Slack Metadata Fields */}
            {formData.application === "slack" && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Configuration Slack</h3>

                  <div className="space-y-2">
                    <Label htmlFor="channelId">ID du canal *</Label>
                    <Input
                      id="channelId"
                      type="text"
                      placeholder="Ex: C1234567890"
                      value={formData.channelId}
                      onChange={(e) => handleInputChange("channelId", e.target.value)}
                      className={errors.channelId ? "border-destructive" : ""}
                    />
                    {errors.channelId && <p className="text-sm text-destructive">{errors.channelId}</p>}
                    <p className="text-xs text-muted-foreground">L&apos;ID du canal Slack où envoyer les notifications</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="userId">ID de l&apos;utilisateur *</Label>
                    <Input
                      id="userId"
                      type="text"
                      placeholder="Ex: U1234567890"
                      value={formData.userId}
                      onChange={(e) => handleInputChange("userId", e.target.value)}
                      className={errors.userId ? "border-destructive" : ""}
                    />
                    {errors.userId && <p className="text-sm text-destructive">{errors.userId}</p>}
                    <p className="text-xs text-muted-foreground">L&apos;ID de l&apos;utilisateur Slack à mentionner</p>
                  </div>
                </div>
              </>
            )}

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <Link href="/">
                <Button variant="outline" type="button">
                  Annuler
                </Button>
              </Link>
              <Button type="submit" disabled={submitting} className="bg-primary hover:bg-primary/90">
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-foreground mr-2"></div>
                    Mise à jour...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Mettre à jour
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
