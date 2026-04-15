import type { ComponentType, ReactElement } from "react";

export type ScreenItem = {
  label: string;
  icon: ReactElement;
  Screen: ComponentType<any>;
};

export function formatDate(iso?: string | null): string {
  if (!iso) return "N/A";
  try {
    const d = new Date(iso);
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    const yyyy = d.getFullYear();
    const hh = d.getHours();
    const min = String(d.getMinutes()).padStart(2, "0");
    const ampm = hh >= 12 ? "PM" : "AM";
    const h12 = hh % 12 || 12;
    return `${mm}/${dd}/${yyyy} ${h12}:${min} ${ampm}`;
  } catch {
    return iso;
  }
}

export const getStatusColor = (status: string) => {
  const stt = status.toLowerCase();
  if (["finish", "completed", "success"].includes(stt)) return "green";
  if (["failed", "error"].includes(stt)) return "red";
  if (stt === "cancelled") return "orange";
  return "grey";
};

export const getBatteryColor = (b: number) =>
  b > 30 ? "green" : b > 20 ? "orange" : "red";
