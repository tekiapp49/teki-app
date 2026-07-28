import FicheCommerce from "@/components/fiche/FicheCommerce";

export default async function FichePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <FicheCommerce id={id} />;
}
