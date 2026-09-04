import { getKmsFunnel, type KmsFunnel } from "@/lib/kms/stats";

const STEPS: { key: keyof KmsFunnel; label: string }[] = [
  { key: "views", label: "Pregledi" },
  { key: "tried", label: "Probali proizvod" },
  { key: "generated", label: "Generisani rezultati" },
  { key: "buyClicks", label: "Klikovi na kupovinu" },
  { key: "shareClicks", label: "Share klikovi" },
];

export async function KmsFunnelCard({ shopId }: { shopId: string }) {
  let funnel;
  try {
    funnel = await getKmsFunnel(shopId);
  } catch {
    return null;
  }

  const ranges = [
    { label: "Danas", data: funnel.today },
    { label: "7 dana", data: funnel.last7 },
    { label: "30 dana", data: funnel.last30 },
  ];

  return (
    <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5">
      <h3 className="text-base font-semibold">Funnel</h3>
      <p className="text-sm text-muted-foreground">
        Put kupca od otvaranja linka do klika na kupovinu.
      </p>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-black/5 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th className="pb-2 pr-4 font-medium">Korak</th>
              {ranges.map((r) => (
                <th key={r.label} className="pb-2 pl-4 text-right font-medium">
                  {r.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {STEPS.map((step) => (
              <tr key={step.key} className="border-b border-black/5 last:border-0">
                <td className="py-2.5 pr-4">{step.label}</td>
                {ranges.map((r) => (
                  <td
                    key={r.label}
                    className="py-2.5 pl-4 text-right font-semibold tabular-nums"
                  >
                    {r.data[step.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {funnel.last30.views === 0 && (
        <p className="mt-4 rounded-lg bg-[#FDF8F5] px-3 py-2 text-xs text-muted-foreground">
          Još nema poseta. Podeli svoj KakoMiStoji link na Instagramu da bi se
          brojke popunile.
        </p>
      )}
    </div>
  );
}
