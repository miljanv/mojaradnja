"use client";

import { useMemo, useState, useTransition } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  adminChangeAiCredits,
  adminSetShopTryOn,
} from "@/lib/actions/admin-try-on";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Tx = {
  id: string;
  amount: number;
  type: string;
  note: string | null;
  createdAt: Date;
};

type Job = {
  id: string;
  status: string;
  errorCode: string | null;
  errorMessage: string | null;
  createdAt: Date;
  product: { name: string };
};

type KmsInfo = {
  publicUrl: string;
  slug: string;
  ownerEnabled: boolean;
  instagramUsername: string | null;
  purchaseUrl: string | null;
  totalJobs: number;
};

const PRESETS = [10, 30, 50, 200];

export function AdminShopTryOnPanel({
  shopId,
  enabled,
  aiCredits,
  transactions,
  jobs,
  kms,
}: {
  shopId: string;
  enabled: boolean;
  aiCredits: number;
  transactions: Tx[];
  jobs: Job[];
  kms: KmsInfo;
}) {
  const [pending, startTransition] = useTransition();
  const [isEnabled, setIsEnabled] = useState(enabled);
  const [credits, setCredits] = useState(aiCredits);
  const [customAmount, setCustomAmount] = useState("");
  const [note, setNote] = useState("");
  const [pendingAmount, setPendingAmount] = useState<number | null>(null);

  const amountToApply = useMemo(() => {
    if (pendingAmount != null) return pendingAmount;
    const n = Number(customAmount);
    return Number.isFinite(n) && n !== 0 ? Math.trunc(n) : null;
  }, [pendingAmount, customAmount]);

  function toggleEnabled(next: boolean) {
    startTransition(async () => {
      const result = await adminSetShopTryOn(shopId, next);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setIsEnabled(next);
      if (typeof result.data?.aiCredits === "number") {
        setCredits(result.data.aiCredits);
        toast.success(
          `KakoMiStoji uključen — dodato ${result.data.aiCredits} besplatnih proba`
        );
        return;
      }
      toast.success(next ? "KakoMiStoji omogućen" : "KakoMiStoji onemogućen");
    });
  }

  function grantTenFree() {
    startTransition(async () => {
      const result = await adminChangeAiCredits(
        shopId,
        10,
        "Početnih 10 besplatnih KakoMiStoji proba"
      );
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCredits(result.data!.aiCredits);
      toast.success("Dodato 10 besplatnih proba");
    });
  }

  function applyCredits() {
    if (amountToApply == null) {
      toast.error("Unesite količinu kredita");
      return;
    }
    if (!note.trim()) {
      toast.error("Napomena je obavezna za ručnu korekciju");
      return;
    }
    startTransition(async () => {
      const result = await adminChangeAiCredits(shopId, amountToApply, note);
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      setCredits(result.data!.aiCredits);
      setNote("");
      setCustomAmount("");
      setPendingAmount(null);
      toast.success("Krediti ažurirani");
    });
  }

  return (
    <div className="mt-6 space-y-6 rounded-xl border border-black/5 bg-[#FDF8F5] p-4 sm:p-5">
      <div>
        <h3 className="text-base font-semibold">KakoMiStoji — krediti za probu</h3>
        <p className="text-sm text-muted-foreground">
          Ti dodaješ kredite shopu. Svaka uspešna proba troši 1 kredit. Kupac nema
          dnevni limit — kad ponestane kredita, proba se pauzira.
        </p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Status</p>
          <p className="text-sm text-muted-foreground">
            {isEnabled ? "Omogućeno" : "Onemogućeno"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={isEnabled}
            disabled={pending}
            onCheckedChange={toggleEnabled}
          />
          <span className="text-sm">{isEnabled ? "Omogućeno" : "Onemogućeno"}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
        <p className="text-sm font-medium">Preostalih proba</p>
          <p className="text-3xl font-bold tabular-nums">{credits}</p>
        </div>
        <div>
          <p className="text-sm font-medium">Ukupno generacija</p>
          <p className="text-3xl font-bold tabular-nums">{kms.totalJobs}</p>
        </div>
      </div>

      <div className="space-y-3 rounded-lg border border-black/5 bg-white p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-sm font-semibold">KakoMiStoji</h4>
          <Badge variant={kms.ownerEnabled ? "secondary" : "outline"}>
            {kms.ownerEnabled
              ? "Vlasnik uključio javnu stranicu"
              : "Vlasnik isključio javnu stranicu"}
          </Badge>
        </div>

        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-muted-foreground">Public slug</dt>
            <dd className="font-medium">{kms.slug}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Instagram</dt>
            <dd className="font-medium">
              {kms.instagramUsername ? `@${kms.instagramUsername}` : "—"}
            </dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-muted-foreground">Link za kupovinu</dt>
            <dd className="truncate font-medium">{kms.purchaseUrl || "—"}</dd>
          </div>
        </dl>

        <code className="block truncate rounded bg-[#FDF8F5] px-3 py-2 text-xs">
          {kms.publicUrl}
        </code>

        <div className="flex flex-wrap gap-2">
          <a href={kms.publicUrl} target="_blank" rel="noopener noreferrer">
            <Button type="button" size="sm" variant="outline">
              Otvori KakoMiStoji stranicu
            </Button>
          </a>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              void navigator.clipboard.writeText(kms.publicUrl).then(
                () => toast.success("Link kopiran"),
                () => toast.error("Kopiranje nije uspelo")
              );
            }}
          >
            Kopiraj link
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Dodaj ili oduzmi probe</p>
        <Button type="button" disabled={pending} onClick={grantTenFree}>
          +10 besplatnih proba
        </Button>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((n) => (
            <Button
              key={`+${n}`}
              type="button"
              size="sm"
              variant={pendingAmount === n ? "default" : "outline"}
              disabled={pending}
              onClick={() => {
                setPendingAmount(n);
                setCustomAmount("");
              }}
            >
              +{n}
            </Button>
          ))}
          {PRESETS.map((n) => (
            <Button
              key={`-${n}`}
              type="button"
              size="sm"
              variant={pendingAmount === -n ? "default" : "outline"}
              disabled={pending}
              onClick={() => {
                setPendingAmount(-n);
                setCustomAmount("");
              }}
            >
              −{n}
            </Button>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor={`custom-${shopId}`}>Custom količina</Label>
            <Input
              id={`custom-${shopId}`}
              type="number"
              placeholder="npr. 75 ili -5"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setPendingAmount(null);
              }}
            />
          </div>
          <div>
            <Label htmlFor={`note-${shopId}`}>Napomena</Label>
            <Textarea
              id={`note-${shopId}`}
              placeholder="npr. Uplata za 50 kredita"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>
        </div>
        <Button type="button" disabled={pending} onClick={applyCredits}>
          Sačuvaj promenu
        </Button>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Istorija kredita</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Datum</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>Iznos</TableHead>
              <TableHead>Napomena</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Nema transakcija
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(tx.createdAt), "dd.MM.yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{tx.type}</Badge>
                  </TableCell>
                  <TableCell className="tabular-nums">
                    {tx.amount > 0 ? `+${tx.amount}` : tx.amount}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate text-sm">
                    {tx.note || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div>
        <h4 className="mb-2 text-sm font-semibold">Poslednji Try-On jobovi</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vreme</TableHead>
              <TableHead>Proizvod</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Greška</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-muted-foreground">
                  Nema jobova
                </TableCell>
              </TableRow>
            ) : (
              jobs.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="whitespace-nowrap text-sm">
                    {format(new Date(job.createdAt), "dd.MM.yyyy HH:mm")}
                  </TableCell>
                  <TableCell>{job.product.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{job.status}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                    {job.errorCode || "—"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
