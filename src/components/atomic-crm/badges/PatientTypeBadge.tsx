import type { Contact } from "../types";

type PatientType = Contact["patient_type"];

const patientTypeConfig: Record<
  NonNullable<PatientType>,
  { label: string; colorClass: string; bgClass: string }
> = {
  prosthetics: {
    label: "Prosthetics",
    colorClass: "text-blue-700",
    bgClass: "bg-blue-100",
  },
  orthotics: {
    label: "Orthotics",
    colorClass: "text-emerald-700",
    bgClass: "bg-emerald-100",
  },
  both: {
    label: "Both",
    colorClass: "text-purple-700",
    bgClass: "bg-purple-100",
  },
};

export const PatientTypeBadge = ({
  patientType,
}: {
  patientType?: PatientType;
}) => {
  if (!patientType) return null;

  const config = patientTypeConfig[patientType];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bgClass} ${config.colorClass}`}
    >
      {config.label}
    </span>
  );
};
