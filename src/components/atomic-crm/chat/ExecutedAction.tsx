import { Link } from "react-router-dom";
import {
  Building2,
  User,
  DollarSign,
  CheckSquare,
  StickyNote,
  Check,
  X,
  ExternalLink,
} from "lucide-react";

import type { ChatExecutedAction } from "../types";

interface ExecutedActionProps {
  action: ChatExecutedAction;
}

const getActionIcon = (type: ChatExecutedAction["type"]) => {
  switch (type) {
    case "create_company":
    case "update_company":
      return Building2;
    case "create_contact":
    case "update_contact":
    case "link_contact_to_company":
      return User;
    case "create_deal":
      return DollarSign;
    case "create_task":
      return CheckSquare;
    case "create_note":
      return StickyNote;
    default:
      return Check;
  }
};

const getRecordPath = (
  recordType: string | undefined,
  recordId: number | undefined,
) => {
  if (!recordType || !recordId) return null;

  switch (recordType) {
    case "company":
      return `/companies/${recordId}/show`;
    case "contact":
      return `/contacts/${recordId}/show`;
    case "deal":
      return `/deals/${recordId}/show`;
    case "task":
      return `/contacts`; // Tasks are shown on contact page
    case "note":
      return null; // Notes don't have their own page
    default:
      return null;
  }
};

export const ExecutedAction = ({ action }: ExecutedActionProps) => {
  const Icon = getActionIcon(action.type);
  const recordPath = getRecordPath(
    action.result?.recordType,
    action.result?.recordId,
  );

  return (
    <div
      className={`
        flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left
        ${
          action.success
            ? "bg-green-50 border-green-200"
            : "bg-red-50 border-red-200"
        }
      `}
    >
      {/* Status Icon */}
      <div
        className={`
          flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
          ${action.success ? "bg-green-100" : "bg-red-100"}
        `}
      >
        {action.success ? (
          <Icon className="w-3.5 h-3.5 text-green-600" strokeWidth={2} />
        ) : (
          <X className="w-3.5 h-3.5 text-red-600" strokeWidth={2} />
        )}
      </div>

      {/* Description */}
      <div className="flex-1 min-w-0">
        <p
          className={`
            text-sm font-sans truncate
            ${action.success ? "text-green-800" : "text-red-800"}
          `}
        >
          {action.description}
        </p>
        {action.error && (
          <p className="text-xs text-red-600 font-sans mt-0.5 truncate">
            {action.error}
          </p>
        )}
      </div>

      {/* Link to record */}
      {action.success && recordPath && (
        <Link
          to={recordPath}
          className="flex-shrink-0 text-green-600 hover:text-green-800 transition-colors"
        >
          <ExternalLink className="w-4 h-4" strokeWidth={2} />
        </Link>
      )}
    </div>
  );
};
