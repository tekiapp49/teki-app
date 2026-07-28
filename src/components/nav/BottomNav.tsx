"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, Heart, Map, User, type LucideIcon } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";

// Barre toujours visible. Un visiteur voit les 4 onglets ; toucher
// Favoris / Profil déclenche l'inscription (puis l'ouverture de l'écran).
const ITEMS: {
  label: string;
  href: string;
  Icon: LucideIcon;
  protege: boolean;
}[] = [
  { label: "Explorer", href: "/fil", Icon: Compass, protege: false },
  { label: "Carte", href: "/", Icon: Map, protege: false },
  { label: "Favoris", href: "/favoris", Icon: Heart, protege: true },
  { label: "Profil", href: "/profil", Icon: User, protege: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, requireAuth } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1500] mx-auto flex max-w-md items-stretch border-t border-divider bg-app px-1.5 pb-[max(env(safe-area-inset-bottom),0.65rem)] pt-2">
      {ITEMS.map(({ label, href, Icon, protege }) => {
        const actif = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => {
              if (protege && !user) {
                e.preventDefault();
                requireAuth(() => router.push(href));
              }
            }}
            className={`flex flex-1 flex-col items-center gap-[3px] py-1 text-[10.5px] ${
              actif ? "font-bold text-acc-700" : "text-sand-600"
            }`}
          >
            <Icon size={21} strokeWidth={2.75} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
