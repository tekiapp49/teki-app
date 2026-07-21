import BottomNav from "@/components/nav/BottomNav";

// Placeholder — la messagerie est différée en V1 (voir CLAUDE.md) ;
// au départ un simple lien « contacter » depuis les fiches suffit.
export default function MessagesPage() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-brand-cream px-5 pb-28 pt-16">
      <h1 className="text-2xl font-bold text-brand-text">Messages</h1>
      <p className="mt-2 text-sm text-brand-text-secondary">Bientôt disponible.</p>
      <BottomNav />
    </main>
  );
}
