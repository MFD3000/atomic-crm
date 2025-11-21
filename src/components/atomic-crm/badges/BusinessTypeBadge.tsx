import type { Company } from "../types";

type BusinessType = Company["business_type"];

const businessTypeConfig: Record<
  NonNullable<BusinessType>,
  { label: string; colorClass: string; bgClass: string }
> = {
  franchisee: {
    label: "Franchisee",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-100",
  },
  patient: {
    label: "Patient",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
  },
  doctor: {
    label: "Doctor",
    colorClass: "text-purple-700",
    bgClass: "bg-purple-100",
  },
  supplier: {
    label: "Supplier",
    colorClass: "text-slate-700",
    bgClass: "bg-slate-100",
  },
  other: {
    label: "Other",
    colorClass: "text-slate-600",
    bgClass: "bg-slate-50",
  },
};

export const BusinessTypeBadge = ({
  businessType,
}: {
  businessType?: BusinessType;
}) => {
  if (!businessType) return null;

  const config = businessTypeConfig[businessType];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.colorClass}`}
    >
      {config.label}
    </span>
  );
};
