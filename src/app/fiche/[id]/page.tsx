import { notFound } from "next/navigation";
import FicheCommerce from "@/components/fiche/FicheCommerce";
import { getFicheDemo } from "@/lib/fiches/demo";

export default async function FichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = getFicheDemo(id);
  if (!fiche) notFound();
  return <FicheCommerce fiche={fiche} />;
}
