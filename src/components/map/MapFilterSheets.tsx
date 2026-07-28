"use client";

import { Check } from "lucide-react";
import { FAMILLES, type Filtre } from "@/lib/feed/demo";

const MOIS_COURTS = [
  "janv.",
  "févr.",
  "mars",
  "avr.",
  "mai",
  "juin",
  "juil.",
  "août",
  "sept.",
  "oct.",
  "nov.",
  "déc.",
];

function isoLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const c = new Date(d);
  c.setDate(c.getDate() + n);
  return c;
}

export function dateFiltreLabel(iso: string | null): string {
  if (!iso) return "Toutes dates";
  const now = new Date();
  if (iso === isoLocal(now)) return "Aujourd'hui";
  if (iso === isoLocal(addDays(now, 1))) return "Demain";
  const d = new Date(`${iso}T12:00:00`);
  return `${d.getDate()} ${MOIS_COURTS[d.getMonth()]}`;
}

function Sheet({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[2000] flex flex-col justify-end">
      <button
        type="button"
        aria-label="Fermer"
        onClick={onClose}
        className="absolute inset-0 bg-ink/30"
      />
      <div className="pointer-events-auto relative mx-auto w-full max-w-md rounded-t-[30px] bg-app px-6 pb-8 pt-6">
        <h1 className="font-display text-[20px]">{title}</h1>
        {children}
      </div>
    </div>
  );
}

function Row({
  label,
  actif,
  onClick,
}: {
  label: string;
  actif: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center justify-between border-b border-divider py-3.5 text-left last:border-b-0"
    >
      <span className={`text-[15px] ${actif ? "font-semibold text-ink" : "text-ink"}`}>
        {label}
      </span>
      {actif && <Check size={18} strokeWidth={2.75} className="text-acc2-700" />}
    </button>
  );
}

export function TypePicker({
  current,
  onSelect,
  onClose,
}: {
  current: Filtre;
  onSelect: (f: Filtre) => void;
  onClose: () => void;
}) {
  return (
    <Sheet title="Type d'activité" onClose={onClose}>
      <div className="mt-2">
        {FAMILLES.map(({ key, label }) => (
          <Row
            key={key}
            label={label}
            actif={current === key}
            onClick={() => {
              onSelect(key);
              onClose();
            }}
          />
        ))}
      </div>
    </Sheet>
  );
}

export function DatePicker({
  current,
  onSelect,
  onClose,
}: {
  current: string | null;
  onSelect: (iso: string | null) => void;
  onClose: () => void;
}) {
  const now = new Date();
  const today = isoLocal(now);
  const tomorrow = isoLocal(addDays(now, 1));
  const daysToSat = (6 - now.getDay() + 7) % 7;
  const samedi = isoLocal(addDays(now, daysToSat));

  const options: { label: string; value: string | null }[] = [
    { label: "Toutes les dates", value: null },
    { label: "Aujourd'hui", value: today },
    { label: "Demain", value: tomorrow },
    { label: "Ce week-end", value: samedi },
  ];

  return (
    <Sheet title="Quand ?" onClose={onClose}>
      <div className="mt-2">
        {options.map((o) => (
          <Row
            key={o.label}
            label={o.label}
            actif={current === o.value}
            onClick={() => {
              onSelect(o.value);
              onClose();
            }}
          />
        ))}
      </div>
      <label className="mt-4 block text-[13px] text-sand-600">Autre date</label>
      <input
        type="date"
        value={current ?? ""}
        onChange={(e) => {
          onSelect(e.target.value || null);
          onClose();
        }}
        className="mt-1 w-full rounded-2xl bg-surface px-4 py-3 text-[15px] text-ink outline-none"
      />
    </Sheet>
  );
}
