"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { Pencil, Trash2, ExternalLink, Loader2 } from "lucide-react";

export function ProductRowActions({ id, slug, title }: { id: string; slug: string; title: string }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const onDelete = async () => {
    if (!confirm(`Delete “${title}”? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setDeleting(false);
    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      alert(data.error === "unauthorized" ? "Unauthorized — admin token required." : "Delete failed.");
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      <Link
        href={`/product/${slug}`}
        target="_blank"
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-mint-50 hover:text-ink"
        title="View live"
      >
        <ExternalLink size={15} />
      </Link>
      <Link
        href={`/admin/products/${id}/edit`}
        className="grid h-8 w-8 place-items-center rounded-lg text-ink-muted hover:bg-mint-50 hover:text-ink"
        title="Edit"
      >
        <Pencil size={15} />
      </Link>
      <button
        type="button"
        onClick={onDelete}
        disabled={deleting}
        className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-50 disabled:opacity-50"
        title="Delete"
      >
        {deleting ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
      </button>
    </div>
  );
}
