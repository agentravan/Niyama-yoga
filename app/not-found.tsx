import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-28 text-center">
      <p className="section-eyebrow">404</p>
      <h1 className="font-display mt-3 text-4xl font-semibold">This pose doesn&apos;t exist</h1>
      <p className="muted mt-3">The page you&apos;re looking for has moved or never was.</p>
      <Link href="/" className="btn-primary mt-8">Back to home</Link>
    </div>
  );
}
