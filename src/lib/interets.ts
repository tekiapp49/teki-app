import {
  Dumbbell,
  HeartHandshake,
  Leaf,
  Music,
  type LucideIcon,
} from "lucide-react";

// Centres d'intérêt proposés à la complétion du profil (icônes Lucide).
export const INTERETS: { key: string; label: string; Icon: LucideIcon }[] = [
  { key: "culture", label: "Culture", Icon: Music },
  { key: "sport", label: "Sport", Icon: Dumbbell },
  { key: "entraide", label: "Entraide", Icon: HeartHandshake },
  { key: "nature", label: "Nature", Icon: Leaf },
];

export function labelInteret(key: string): string {
  return INTERETS.find((i) => i.key === key)?.label ?? key;
}
