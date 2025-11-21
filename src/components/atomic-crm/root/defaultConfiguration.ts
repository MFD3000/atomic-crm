import { Mars, NonBinary, Venus } from "lucide-react";

export const defaultDarkModeLogo = "./logos/logo_us_prosthetix_dark.svg";
export const defaultLightModeLogo = "./logos/logo_us_prosthetix_light.svg";

export const defaultTitle = "US Prosthetix";

export const defaultCompanySectors = [
  "Medical Devices",
  "Prosthetics/Orthotics",
  "Healthcare Services",
  "Medical Billing",
  "Rehabilitation",
  "Physical Therapy",
  "Orthopedic Care",
  "Durable Medical Equipment",
  "Healthcare Technology",
  "Medical Supply",
];

export const defaultDealStages = [
  { value: "inquiry", label: "Inquiry" },
  { value: "assessment", label: "Assessment" },
  { value: "fitting", label: "Fitting" },
  { value: "fabrication", label: "Fabrication" },
  { value: "delivery", label: "Delivery" },
  { value: "follow-up", label: "Follow-up" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
];

export const defaultDealPipelineStatuses = ["won"];

export const defaultDealCategories = [
  "Prosthetics",
  "Orthotics",
  "Both",
  "Franchise Opportunity",
  "Billing Services",
];

export const defaultNoteStatuses = [
  { value: "cold", label: "Cold", color: "#7dbde8" },
  { value: "warm", label: "Warm", color: "#e8cb7d" },
  { value: "hot", label: "Hot", color: "#e88b7d" },
  { value: "in-contract", label: "In Contract", color: "#a4e87d" },
];

export const defaultTaskTypes = [
  "None",
  "Patient Assessment",
  "Fitting Appointment",
  "Fabrication Check",
  "Delivery Scheduled",
  "Follow-up Call",
  "Billing Review",
  "Franchisee Meeting",
  "Doctor Consultation",
  "51 Oakwood Prospect Call",
];

export const defaultContactGender = [
  { value: "male", label: "He/Him", icon: Mars },
  { value: "female", label: "She/Her", icon: Venus },
  { value: "nonbinary", label: "They/Them", icon: NonBinary },
];
