import { Check, Minus } from "lucide-react";
import { FEATURES, PLANS, formatPrice, planIncludes } from "@/lib/plans";

export function ComparisonTable() {
  return (
    <div className="glass overflow-hidden rounded-3xl">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] text-sm">
          <caption className="sr-only">Membership feature comparison</caption>
          <thead>
            <tr className="border-b border-sage-900/10 dark:border-white/10">
              <th scope="col" className="p-4 text-left font-semibold sm:p-5">Features</th>
              {PLANS.map((p) => (
                <th key={p.id} scope="col" className={`p-4 text-center sm:p-5 ${p.id === "3m" ? "bg-sage-600/10" : ""}`}>
                  <div className="font-display text-base font-semibold">{p.name}</div>
                  <div className="muted mt-0.5 text-xs font-normal">{formatPrice(p.perMonth)}/mo</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FEATURES.map((f, i) => (
              <tr key={f.key} className={i % 2 ? "bg-sage-900/[0.02] dark:bg-white/[0.02]" : ""}>
                <th scope="row" className="p-4 text-left font-normal sm:px-5">{f.label}</th>
                {PLANS.map((p) => (
                  <td key={p.id} className={`p-4 text-center ${p.id === "3m" ? "bg-sage-600/10" : ""}`}>
                    {planIncludes(p.id, f.key) ? (
                      <Check className="mx-auto h-5 w-5 text-sage-600 dark:text-sage-400" aria-label="Included" />
                    ) : (
                      <Minus className="mx-auto h-5 w-5 text-sand-300 dark:text-white/20" aria-label="Not included" />
                    )}
                  </td>
                ))}
              </tr>
            ))}
            <tr className="border-t border-sage-900/10 dark:border-white/10">
              <th scope="row" className="p-4 text-left font-semibold sm:px-5">Total upfront</th>
              {PLANS.map((p) => (
                <td key={p.id} className={`p-4 text-center font-semibold ${p.id === "3m" ? "bg-sage-600/10" : ""}`}>
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
