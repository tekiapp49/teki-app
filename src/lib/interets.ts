import {
  IconBallFootball,
  IconHeartHandshake,
  IconLeaf,
  IconMusic,
  type Icon,
} from "@tabler/icons-react";

// Centres d'intérêt proposés à la complétion du profil (icônes outline).
export const INTERETS: { key: string; label: string; Icon: Icon }[] = [
  { key: "culture", label: "Culture", Icon: IconMusic },
  { key: "sport", label: "Sport", Icon: IconBallFootball },
  { key: "entraide", label: "Entraide", Icon: IconHeartHandshake },
  { key: "nature", label: "Nature", Icon: IconLeaf },
];

export function labelInteret(key: string): string {
  return INTERETS.find((i) => i.key === key)?.label ?? key;
}
