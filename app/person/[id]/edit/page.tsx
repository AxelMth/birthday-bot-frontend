"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { contactMethodsClient, peopleClient } from "@/lib/api-client"
import Link from "next/link"

type PersonFormData = {
  name: string | undefined
  birthDate: string | undefined
  application: string | undefined
  applicationMetadata: Record<string, string> | undefined
}

type ContactMethod = {
  id: number
  application: string
  applicationMetadata: Record<string, string>
}

export default function EditPersonPage() {
  const router = useRouter()
  const params = useParams()
  const personId = Number.parseInt(params.id as string)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [personName, setPersonName] = useState<string | null>(null)
  const [contactMethods, setContactMethods] = useState<ContactMethod[] | null>(null)
  const [formData, setFormData] = useState<PersonFormData>({
    name: undefined,
    birthDate: undefined,
    application: undefined,
    applicationMetadata: undefined,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch person data on component mount
  useEffect(() => {
    const fetchPerson = async () => {
      try {
        setLoading(true)
        const personData = await peopleClient.getPersonById({
          params: {
            id: personId,
          },
        })
        if (personData.status === 200) {
          const person = personData.body
          setPersonName(person.name ?? "")
          setFormData({
            name: person.name,
            birthDate: person.birthDate?.toISOString().split("T")[0],
            application: person.application,
            applicationMetadata: person.metadata as Record<string, string>,
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

  useEffect(() => {
    const fetchContactMethods = async () => {
      const contactMethodsResponse = await contactMethodsClient.getContactMethods()

      if (contactMethodsResponse.status === 200) {
        const contactMethods = contactMethodsResponse.body.contactMethods ?? []
        setContactMethods(contactMethods.map((contactMethod) => ({
          id: contactMethod.id ?? 0,
          application: contactMethod.application ?? "",
          applicationMetadata: contactMethod.metadata as Record<string, string>,
        })))
      } else {
        setErrors({ fetch: "Erreur lors du chargement des méthodes de contact" })
      }
    }
    fetchContactMethods()
  }, [])

  const applicationNames = useMemo(() => {
    return contactMethods?.map((contactMethod) => contactMethod.application) ?? []
  }, [contactMethods])
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name?.trim()) {
      newErrors.name = "Le nom est requis"
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "La date d'anniversaire est requise"
    }

    if (!formData.application) {
      newErrors.application = "L'application est requise"
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
      const metadata: Record<string, string> = formData.applicationMetadata as Record<string, string>

      const response = await peopleClient.updatePersonById({
        params: {
          id: personId,
        },
        body: {
          name: formData.name?.trim(),
          birthDate: new Date(formData.birthDate ?? ""),
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
          <p className="text-muted-foreground mt-1">Modifier les informations de {personName}</p>
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
              <Label htmlFor="birthDate">Date d&apos;anniversaire *</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleInputChange("birthDate", e.target.value)}
                className={errors.birthDate ? "border-destructive" : ""}
              />
              {errors.birthDate && <p className="text-sm text-destructive">{errors.birthDate}</p>}
            </div>

            {/* Application Selection Field */}
            <div className="space-y-2">
              <Label htmlFor="application">Application *</Label>
              <Select value={formData.application} onValueChange={(value) => handleInputChange("application", value)}>
                <SelectTrigger className={errors.application ? "border-destructive" : ""}>
                  <SelectValue placeholder="Sélectionnez une application" />
                </SelectTrigger>
                <SelectContent>
                  {applicationNames.map((applicationName: string, index: number) => (
                    <SelectItem key={applicationName + index} value={applicationName}>
                      {applicationName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.application && <p className="text-sm text-destructive">{errors.application}</p>}
            </div>

            {/* Application Metadata Fields */}
            {formData.application && contactMethods?.find((contactMethod) => contactMethod.application === formData.application) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Configuration {formData.application}</h3>
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
