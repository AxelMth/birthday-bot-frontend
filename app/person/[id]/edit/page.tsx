"use client";

import type React from "react";
import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { contactMethodsClient, peopleClient, groupClient } from "@/lib/api-client";
import Link from "next/link";

type PersonFormData = {
  name: string | undefined;
  birthDate: string | undefined;
  applicationName: string | undefined;
  applicationMetadata: Record<string, string> | undefined;
  groupId: string;
};

type ContactMethod = {
  id: number;
  applicationName: string;
  applicationMetadata: Record<string, string>;
};

type Group = { id: number; name: string };

export default function EditPersonPage() {
  const router = useRouter();
  const params = useParams();
  const personId = Number.parseInt(params.id as string);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [personName, setPersonName] = useState<string | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [contactMethods, setContactMethods] = useState<ContactMethod[] | null>(
    null,
  );
  const [formData, setFormData] = useState<PersonFormData>({
    name: undefined,
    birthDate: undefined,
    applicationName: undefined,
    applicationMetadata: undefined,
    groupId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const [personData, contactMethodsResponse, groupsResponse] =
          await Promise.all([
            peopleClient.getPersonById({ params: { id: personId } }),
            contactMethodsClient.getContactMethods(),
            groupClient.getGroups(),
          ]);

        if (personData.status === 200) {
          const person = personData.body;
          setPersonName(person.name ?? "");
          setFormData({
            name: person.name,
            birthDate: person.birthDate?.toISOString().split("T")[0],
            applicationName: person.application ?? "",
            applicationMetadata: person.applicationMetadata as Record<
              string,
              string
            >,
            groupId: person.groupId ? String(person.groupId) : "",
          });
        } else {
          setErrors({ fetch: "Erreur lors du chargement des données" });
        }

        if (contactMethodsResponse.status === 200) {
          setContactMethods(
            (contactMethodsResponse.body.contactMethods ?? []).map((cm) => ({
              id: cm.id ?? 0,
              applicationName: cm.applicationName ?? "",
              applicationMetadata: cm.applicationMetadata as Record<
                string,
                string
              >,
            })),
          );
        }

        if (groupsResponse.status === 200) {
          setGroups(
            (groupsResponse.body.groups ?? []).map((g) => ({
              id: g.id!,
              name: g.name!,
            })),
          );
        }
      } finally {
        setLoading(false);
      }
    };

    if (personId) fetchData();
  }, [personId]);

  const applicationNames = useMemo(() => {
    return (
      contactMethods?.map((cm) => cm.applicationName) ?? []
    );
  }, [contactMethods]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name?.trim()) newErrors.name = "Le nom est requis";
    if (!formData.birthDate) newErrors.birthDate = "La date d'anniversaire est requise";
    if (!formData.applicationName) newErrors.applicationName = "L'application est requise";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);

    try {
      const metadata: Record<string, string> =
        formData.applicationMetadata as Record<string, string>;

      const response = await peopleClient.updatePersonById({
        params: { id: personId },
        body: {
          name: formData.name?.trim(),
          birthDate: new Date(formData.birthDate ?? ""),
          application: formData.applicationName,
          applicationMetadata:
            metadata && Object.keys(metadata).length > 0 ? metadata : undefined,
          groupId: formData.groupId ? Number(formData.groupId) : undefined,
        },
      });

      if (response.status === 200) {
        router.push("/people");
      } else {
        setErrors({ submit: "Erreur lors de la mise à jour de la personne" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleApplicationMetadataChange = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      applicationMetadata: { ...prev.applicationMetadata, [key]: value },
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <div className="flex justify-center items-center py-8">
          <p style={{ color: "var(--muted)" }}>Chargement...</p>
        </div>
      </div>
    );
  }

  if (errors.fetch) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 py-8">
        <p className="text-destructive text-center">{errors.fetch}</p>
        <div className="text-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/people">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
            Modifier {personName}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="birthDate">Date d&apos;anniversaire *</Label>
          <Input
            id="birthDate"
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className={errors.birthDate ? "border-destructive" : ""}
          />
          {errors.birthDate && (
            <p className="text-sm text-destructive">{errors.birthDate}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="group">Groupe</Label>
          <Select
            value={formData.groupId}
            onValueChange={(value) => handleInputChange("groupId", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionnez un groupe" />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={String(group.id)}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Separator />

        <div className="space-y-2">
          <Label htmlFor="application">Application *</Label>
          <Select
            value={formData.applicationName}
            onValueChange={(value) =>
              handleInputChange("applicationName", value)
            }
          >
            <SelectTrigger
              className={errors.applicationName ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Sélectionnez une application" />
            </SelectTrigger>
            <SelectContent>
              {applicationNames.map((name: string, index: number) => (
                <SelectItem key={name + index} value={name}>
                  {name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.applicationName && (
            <p className="text-sm text-destructive">
              {errors.applicationName}
            </p>
          )}
        </div>

        {formData.applicationName &&
          contactMethods?.find(
            (cm) => cm.applicationName === formData.applicationName,
          ) && (
            <div className="space-y-4">
              <span className="text-sm font-semibold" style={{ color: "var(--text)" }}>
                Configuration {formData.applicationName}
              </span>
              {Object.keys(
                contactMethods?.find(
                  (cm) => cm.applicationName === formData.applicationName,
                )?.applicationMetadata ?? {},
              ).map((key) => (
                <div key={key} className="space-y-2">
                  <Label htmlFor={key}>{key}</Label>
                  <Input
                    id={key}
                    type="text"
                    value={formData.applicationMetadata?.[key]}
                    onChange={(e) =>
                      handleApplicationMetadataChange(key, e.target.value)
                    }
                  />
                </div>
              ))}
            </div>
          )}

        {errors.submit && (
          <div className="p-3 rounded-md" style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}>
            <p className="text-sm text-destructive">{errors.submit}</p>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <Link href="/people">
            <Button variant="outline" type="button">
              Annuler
            </Button>
          </Link>
          <Button type="submit" disabled={submitting}>
            {submitting ? "Mise à jour..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Mettre à jour
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
