import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CRAVINGS } from "@/data/taxonomy";
import { getCraving } from "@/lib/db/repository";
import { DirectoryPage } from "@/components/DirectoryPage";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return CRAVINGS.map((c) => ({ craving: c.slug }));
}

export function generateMetadata({ params }: { params: { craving: string } }): Metadata {
  const entry = getCraving(params.craving);
  if (!entry) return { title: "Not found" };
  return {
    title: entry.h1,
    description: entry.answer,
  };
}

export default function CravingPage({ params }: { params: { craving: string } }) {
  const entry = getCraving(params.craving);
  if (!entry) notFound();
  return <DirectoryPage entry={entry} basePath="/low-gi" crumbLabel="Low-GI swaps" />;
}
