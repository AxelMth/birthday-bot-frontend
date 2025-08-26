import React from "react";
import { Badge } from "@/components/ui/badge";

interface ApplicationBadgeProps {
  application: string;
  className?: string;
}

export function ApplicationBadge({ application, className }: ApplicationBadgeProps) {
  const getApplicationBadge = (app: string) => {
    switch (app.toLowerCase()) {
      case "slack":
        return (
          <Badge variant="secondary" className={className}>
            Slack
          </Badge>
        );
      case "none":
        return (
          <Badge variant="outline" className={className}>
            Aucune application
          </Badge>
        );
      case "discord":
        return (
          <Badge variant="default" className={className}>
            Discord
          </Badge>
        );
      case "teams":
        return (
          <Badge variant="secondary" className={className}>
            Teams
          </Badge>
        );
      case "email":
        return (
          <Badge variant="outline" className={className}>
            Email
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className={className}>
            {app}
          </Badge>
        );
    }
  };

  return getApplicationBadge(application);
}
