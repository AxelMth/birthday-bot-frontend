"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import { peopleClient, groupClient } from "@/lib/api-client";
import Link from "next/link";

type Group = { id: number; name: string };

export default function CreatePersonPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    birthDate: "",
    application: "",
    channelId: "",
    userId: "",
    groupId: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await groupClient.getGroups();
        if (response.status === 200) {
          setGroups(
            (response.body.groups ?? []).map((g) => ({
              id: g.id!,
              name: g.name!,
            })),
          );
        }
      } catch {
        console.error("Failed to fetch groups");
      }
    };
    fetchGroups();
  }, []);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Le nom est requis";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "La date d'anniversaire est requise";
    }

    if (!formData.application) {
      newErrors.application = "L'application est requise";
    }

    if (formData.application === "slack") {
      if (!formData.channelId.trim()) {
        newErrors.channelId = "L'ID du canal est requis pour Slack";
      }
      if (!formData.userId.trim()) {
        newErrors.userId = "L'ID de l'utilisateur est requis pour Slack";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const metadata: Record<string, unknown> = {};

      if (formData.application === "slack") {
        metadata.channelId = formData.channelId;
        metadata.userId = formData.userId;
      }

      await peopleClient.createPerson({
        body: {
          name: formData.name.trim(),
          birthDate: new Date(formData.birthDate),
          application: formData.application,
          applicationMetadata:
            Object.keys(metadata).length > 0
              ? (metadata as Record<string, string | number | boolean>)
              : undefined,
          groupId: formData.groupId ? Number(formData.groupId) : undefined,
        },
      });
      router.push("/people");
    } catch (error) {
      console.error("Failed to create person:", error);
      setErrors({ submit: "Erreur lors de la création de la personne" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

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
            Créer une personne
          </h1>
          <p style={{ color: "var(--muted)" }} className="mt-1 text-sm">
            Ajouter une nouvelle personne pour les notifications d&apos;anniversaire
          </p>
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
            value={formData.application}
            onValueChange={(value) => handleInputChange("application", value)}
          >
            <SelectTrigger
              className={errors.application ? "border-destructive" : ""}
            >
              <SelectValue placeholder="Sélectionnez une application" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="slack">Slack</SelectItem>
              <SelectItem value="none">Aucune application</SelectItem>
            </SelectContent>
          </Select>
          {errors.application && (
            <p className="text-sm text-destructive">{errors.application}</p>
          )}
        </div>

        {formData.application === "slack" && (
          <div className="space-y-4">
            <h3 className="text-sm font-semibold" style={{ color: "var(--text)" }}>
              Configuration Slack
            </h3>

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
              {errors.channelId && (
                <p className="text-sm text-destructive">{errors.channelId}</p>
              )}
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
              {errors.userId && (
                <p className="text-sm text-destructive">{errors.userId}</p>
              )}
            </div>
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
          <Button type="submit" disabled={loading}>
            {loading ? "Création..." : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Créer la personne
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
