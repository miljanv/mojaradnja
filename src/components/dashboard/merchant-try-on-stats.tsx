import { getMerchantTryOnStats } from "@/lib/try-on/jobs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export async function MerchantTryOnStatsCard({ shopId }: { shopId: string }) {
  const stats = await getMerchantTryOnStats(shopId);

  if (!stats.virtualTryOnEnabled) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Virtual Try-On</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <p>
          Preostalo AI kredita:{" "}
          <span className="font-semibold tabular-nums">{stats.aiCredits}</span>
        </p>
        <p>
          Ukupno uspešnih probavanja:{" "}
          <span className="font-semibold tabular-nums">{stats.completedTotal}</span>
        </p>
        <p>
          Probavanja u poslednjih 30 dana:{" "}
          <span className="font-semibold tabular-nums">{stats.completed30d}</span>
        </p>
        {stats.aiCredits <= 0 && (
          <p className="pt-1 text-amber-800">
            Virtual Try-On je pauziran jer trenutno nema dostupnih AI kredita.
          </p>
        )}
        {stats.topProducts.length > 0 && (
          <div className="pt-2">
            <p className="mb-1 font-medium">Najprobavaniji proizvodi</p>
            <ul className="space-y-0.5 text-muted-foreground">
              {stats.topProducts.map((p) => (
                <li key={p.productId}>
                  {p.name} · {p.count}
                </li>
              ))}
            </ul>
          </div>
        )}
        <p className="text-muted-foreground">
          Porudžbine nakon probavanja: {stats.ordersAfterTryOn} · Neuspešna:{" "}
          {stats.failedTotal}
        </p>
      </CardContent>
    </Card>
  );
}
