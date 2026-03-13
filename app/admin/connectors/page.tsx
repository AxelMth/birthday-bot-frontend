"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { groupClient, connectorClient } from "@/lib/api-client";
import { Plus, Trash2, Save, CheckCircle, Eye, EyeOff } from "lucide-react";
import {
  Page,
  PageTitle,
  PageContent,
} from "@/components/layout/page";

type Group = { id: number; name: string };
type ConnectorConfig = {
  id: number;
  groupId: number;
  integrationType: string;
  config: Record<string, string | number | boolean | null>;
};
type SchemaField = {
  key: string;
  label: string;
  type: "string" | "number" | "boolean";
  required: boolean;
  sensitive: boolean;
  description?: string;
};

const INTEGRATION_TYPES = ["slack", "email"];

export default function ConnectorAdminPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [connectors, setConnectors] = useState<ConnectorConfig[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(
    null,
  );
  const [schema, setSchema] = useState<SchemaField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showSensitive, setShowSensitive] = useState<Record<string, boolean>>(
    {},
  );

  // Group management
  const [newGroupName, setNewGroupName] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);

  const fetchGroups = useCallback(async () => {
    try {
      const response = await groupClient.getGroups();
      if (response.status === 200) {
        const g = (response.body.groups ?? []).map((gr) => ({
          id: gr.id!,
          name: gr.name!,
        }));
        setGroups(g);
        if (!selectedGroup && g.length > 0) {
          setSelectedGroup(g[0]);
        }
      }
    } catch {
      console.error("Failed to fetch groups");
    }
  }, [selectedGroup]);

  const fetchConnectors = useCallback(async (groupId: number) => {
    try {
      const response = await connectorClient.getGroupConnectors({
        params: { groupId },
      });
      if (response.status === 200) {
        setConnectors(
          (response.body.connectors ?? []).map((c) => ({
            id: c.id!,
            groupId: c.groupId!,
            integrationType: c.integrationType!,
            config: (c.config ?? {}) as Record<string, string | number | boolean | null>,
          })),
        );
      }
    } catch {
      console.error("Failed to fetch connectors");
    }
  }, []);

  const fetchSchema = useCallback(async (integrationType: string) => {
    try {
      const response = await connectorClient.getConnectorSchema({
        params: { integrationType },
      });
      if (response.status === 200) {
        setSchema(
          (response.body.fields ?? []).map((f) => ({
            key: f.key!,
            label: f.label!,
            type: f.type! as "string" | "number" | "boolean",
            required: f.required!,
            sensitive: f.sensitive!,
            description: f.description ?? undefined,
          })),
        );
      }
    } catch {
      console.error("Failed to fetch schema");
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedGroup) {
      fetchConnectors(selectedGroup.id);
      setSelectedIntegration(null);
      setSchema([]);
      setFormValues({});
    }
  }, [selectedGroup, fetchConnectors]);

  useEffect(() => {
    if (selectedIntegration) {
      fetchSchema(selectedIntegration);

      const existingConnector = connectors.find(
        (c) => c.integrationType === selectedIntegration,
      );

      if (existingConnector) {
        const values: Record<string, string> = {};
        for (const [key, value] of Object.entries(existingConnector.config)) {
          values[key] = String(value ?? "");
        }
        setFormValues(values);
      } else {
        setFormValues({});
      }
      setSaved(false);
    }
  }, [selectedIntegration, connectors, fetchSchema]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    setCreatingGroup(true);
    try {
      const response = await groupClient.createGroup({
        body: { name: newGroupName.trim() },
      });
      if (response.status === 200) {
        setNewGroupName("");
        await fetchGroups();
        setSelectedGroup({
          id: response.body.id!,
          name: response.body.name!,
        });
      }
    } catch {
      console.error("Failed to create group");
    } finally {
      setCreatingGroup(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm("Are you sure you want to delete this group?")) return;
    try {
      await groupClient.deleteGroup({ params: { id: groupId } });
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
      await fetchGroups();
    } catch {
      console.error("Failed to delete group");
    }
  };

  const handleSaveConnector = async () => {
    if (!selectedGroup || !selectedIntegration) return;
    setSaving(true);
    try {
      await connectorClient.upsertConnector({
        params: {
          groupId: selectedGroup.id,
          integrationType: selectedIntegration,
        },
        body: { config: formValues },
      });
      setSaved(true);
      await fetchConnectors(selectedGroup.id);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      console.error("Failed to save connector");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteConnector = async () => {
    if (!selectedGroup || !selectedIntegration) return;
    if (!confirm("Are you sure you want to delete this connector?")) return;
    try {
      await connectorClient.deleteConnector({
        params: {
          groupId: selectedGroup.id,
          integrationType: selectedIntegration,
        },
      });
      setFormValues({});
      setSelectedIntegration(null);
      await fetchConnectors(selectedGroup.id);
    } catch {
      console.error("Failed to delete connector");
    }
  };

  const isConfigured = (integrationType: string) =>
    connectors.some((c) => c.integrationType === integrationType);

  return (
    <Page>
      <PageTitle>
        <h1 className="text-2xl font-bold" style={{ color: "var(--text)" }}>
          Connector Administration
        </h1>
      </PageTitle>

      <PageContent>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Left panel: Groups */}
          <div className="space-y-4">
            <h2
              className="text-sm font-semibold uppercase tracking-wider"
              style={{ color: "var(--muted)" }}
            >
              Groups
            </h2>

            <div className="space-y-1">
              {groups.map((group) => (
                <div
                  key={group.id}
                  className="flex items-center justify-between rounded-md px-3 py-2 cursor-pointer transition-colors"
                  style={{
                    background:
                      selectedGroup?.id === group.id
                        ? "var(--surface-2)"
                        : "transparent",
                    color: "var(--text)",
                  }}
                  onClick={() => setSelectedGroup(group)}
                >
                  <span className="text-sm font-medium">{group.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 opacity-50 hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGroup(group.id);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>

            <Separator />

            <div className="flex gap-2">
              <Input
                placeholder="New group name"
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="text-sm"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleCreateGroup();
                }}
              />
              <Button
                size="sm"
                onClick={handleCreateGroup}
                disabled={creatingGroup || !newGroupName.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Right panel: Connector config */}
          <div className="space-y-6">
            {selectedGroup ? (
              <>
                <div>
                  <h2
                    className="text-lg font-semibold"
                    style={{ color: "var(--text)" }}
                  >
                    {selectedGroup.name} - Connectors
                  </h2>
                  <p className="text-sm" style={{ color: "var(--muted)" }}>
                    Configure integration connectors for this group
                  </p>
                </div>

                {/* Integration type tabs */}
                <div className="flex gap-2 flex-wrap">
                  {INTEGRATION_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={
                        selectedIntegration === type ? "default" : "outline"
                      }
                      size="sm"
                      onClick={() => setSelectedIntegration(type)}
                      className="capitalize gap-2"
                    >
                      {type}
                      {isConfigured(type) && (
                        <Badge
                          variant="secondary"
                          className="text-xs px-1.5 py-0"
                        >
                          Active
                        </Badge>
                      )}
                    </Button>
                  ))}
                </div>

                {/* Config form */}
                {selectedIntegration && schema.length > 0 && (
                  <div
                    className="space-y-4 rounded-lg p-4"
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                    }}
                  >
                    <h3
                      className="text-sm font-semibold capitalize"
                      style={{ color: "var(--text)" }}
                    >
                      {selectedIntegration} Configuration
                    </h3>

                    {schema.map((field) => (
                      <div key={field.key} className="space-y-1.5">
                        <Label
                          htmlFor={field.key}
                          className="text-sm flex items-center gap-1"
                        >
                          {field.label}
                          {field.required && (
                            <span className="text-destructive">*</span>
                          )}
                        </Label>
                        <div className="relative">
                          <Input
                            id={field.key}
                            type={
                              field.sensitive && !showSensitive[field.key]
                                ? "password"
                                : field.type === "number"
                                  ? "number"
                                  : "text"
                            }
                            value={formValues[field.key] ?? ""}
                            onChange={(e) =>
                              setFormValues((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            placeholder={field.description}
                          />
                          {field.sensitive && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                              onClick={() =>
                                setShowSensitive((prev) => ({
                                  ...prev,
                                  [field.key]: !prev[field.key],
                                }))
                              }
                            >
                              {showSensitive[field.key] ? (
                                <EyeOff className="h-3.5 w-3.5" />
                              ) : (
                                <Eye className="h-3.5 w-3.5" />
                              )}
                            </Button>
                          )}
                        </div>
                        {field.description && (
                          <p
                            className="text-xs"
                            style={{ color: "var(--muted)" }}
                          >
                            {field.description}
                          </p>
                        )}
                      </div>
                    ))}

                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={handleSaveConnector}
                        disabled={saving}
                        size="sm"
                        className="gap-1.5"
                      >
                        {saved ? (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Saved
                          </>
                        ) : (
                          <>
                            <Save className="h-4 w-4" />
                            {saving ? "Saving..." : "Save"}
                          </>
                        )}
                      </Button>

                      {isConfigured(selectedIntegration) && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={handleDeleteConnector}
                          className="gap-1.5"
                        >
                          <Trash2 className="h-4 w-4" />
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {selectedIntegration && schema.length === 0 && (
                  <p style={{ color: "var(--muted)" }} className="text-sm">
                    No configuration schema available for {selectedIntegration}.
                  </p>
                )}
              </>
            ) : (
              <div
                className="flex items-center justify-center h-48 text-sm"
                style={{ color: "var(--muted)" }}
              >
                Select a group to configure connectors
              </div>
            )}
          </div>
        </div>
      </PageContent>
    </Page>
  );
}
