import { notFound } from "next/navigation";
import ProDashboard from "@/components/pro/ProDashboard";
import { getFicheDemo } from "@/lib/fiches/demo";

export default async function ProPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fiche = getFicheDemo(id);
  if (!fiche) notFound();
  return <ProDashboard fiche={fiche} />;
}
