"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  IconHeart,
  IconMapPin,
  IconMessageCircle,
  IconUser,
  type Icon,
} from "@tabler/icons-react";
import { useAuth } from "@/components/auth/AuthProvider";

// Barre toujours visible. Un visiteur voit les 4 icônes ; toucher
// Favoris / Messages / Profil déclenche l'inscription (puis l'ouverture
// de l'écran une fois inscrit).
const ITEMS: {
  label: string;
  href: string;
  Icon: Icon;
  protege: boolean;
}[] = [
  { label: "TéKi là", href: "/fil", Icon: IconMapPin, protege: false },
  { label: "Favoris", href: "/favoris", Icon: IconHeart, protege: true },
  { label: "Messages", href: "/messages", Icon: IconMessageCircle, protege: true },
  { label: "Profil", href: "/profil", Icon: IconUser, protege: true },
];

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, requireAuth } = useAuth();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-[1500] mx-auto flex max-w-md items-stretch justify-around border-t border-brand-surface-alt bg-brand-cream px-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] pt-2">
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
            className={`flex flex-1 flex-col items-center gap-1 py-1 text-xs ${
              actif
                ? "font-bold text-brand-text"
                : "text-brand-text-on-brown"
            }`}
          >
            <Icon size={22} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
