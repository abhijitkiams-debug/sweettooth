import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page grid min-h-[50vh] place-items-center py-20 text-center">
      <div>
        <p className="font-display text-6xl font-semibold text-mint-600">404</p>
        <h1 className="mt-3 font-display text-2xl font-semibold text-ink">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-2 text-ink-soft">It may have moved, or never existed.</p>
        <Link href="/products" className="btn-primary mt-6">
          Browse certified foods
        </Link>
      </div>
    </div>
  );
}
