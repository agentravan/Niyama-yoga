import type { Metadata } from "next";
import { PricingSection } from "@/components/PricingSection";

export const metadata: Metadata = { title: "Pricing & Memberships" };

export default function PricingPage() {
  return (
    <div className="pt-8">
      <PricingSection />
    </div>
  );
}
