import {
  Activity,
  Baby,
  Droplets,
  Heart,
  HeartPulse,
  Smile,
  Sparkles,
  Stethoscope,
  Syringe,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  "svc-general": Stethoscope,
  "svc-dental": Smile,
  "svc-pediatrics": Baby,
  "svc-dermatology": Sparkles,
  "svc-gynecology": Heart,
  "svc-urology": Droplets,
  "svc-cardiology": HeartPulse,
  "svc-physio": Activity,
  "svc-vaccination": Syringe,
};

export function serviceIcon(serviceId: string): LucideIcon {
  return icons[serviceId] ?? Stethoscope;
}
