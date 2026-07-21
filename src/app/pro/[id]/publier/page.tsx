import { notFound } from "next/navigation";
import ProPublier from "@/components/pro/ProPublier";
import { getFicheDemo } from "@/lib/fiches/demo";

export default async function ProPublierPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = getFicheDemo(id);
  if (!fiche) notFound();
  return <ProPublier fiche={fiche} />;
}
