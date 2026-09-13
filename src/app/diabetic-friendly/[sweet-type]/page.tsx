import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SWEET_TYPES } from "@/data/taxonomy";
import { getSweetType } from "@/lib/db/repository";
import { DirectoryPage } from "@/components/DirectoryPage";

export const revalidate = 3600;
export const dynamicParams = true;

export function generateStaticParams() {
  return SWEET_TYPES.map((c) => ({ "sweet-type": c.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { "sweet-type": string };
}): Metadata {
  const entry = getSweetType(params["sweet-type"]);
  if (!entry) return { title: "Not found" };
  return {
    title: entry.h1,
    description: entry.answer,
  };
}

export default function SweetTypePage({ params }: { params: { "sweet-type": string } }) {
  const entry = getSweetType(params["sweet-type"]);
  if (!entry) notFound();
  return <DirectoryPage entry={entry} basePath="/diabetic-friendly" crumbLabel="Diabetic-friendly" />;
}
