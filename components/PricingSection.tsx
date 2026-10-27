import { ComparisonTable } from "@/components/ComparisonTable";
import { PricingCards } from "@/components/PricingCards";

export function PricingSection({ heading = true }: { heading?: boolean }) {
  return (
    <section id="pricing" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20 sm:px-6">
      {heading && (
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <p className="section-eyebrow">Memberships</p>
          <h2 className="section-title mt-3">Commit to yourself. Save as you grow.</h2>
          <p className="muted mt-4 text-lg">
            Every plan starts with a 3-day free trial. Longer journeys unlock deeper guidance — and a lower price per class.
          </p>
        </div>
      )}
      <PricingCards />
      <div className="mt-16">
        <h3 className="font-display mb-6 text-center text-2xl font-semibold">Compare plans</h3>
        <ComparisonTable />
      </div>
    </section>
  );
}
