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

const PRESETS = [10, 30, 50, 200];

export function AdminShopTryOnPanel({
  shopId,
  enabled,
  aiCredits,
  transactions,
  jobs,
}: {
  shopId: string;
  enabled: boolean;
  aiCredits: number;
  transactions: Tx[];
  jobs: Job[];
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
      toast.success(next ? "Virtual Try-On omogućen" : "Virtual Try-On onemogućen");
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
        <h3 className="text-base font-semibold">Virtual Try-On</h3>
        <p className="text-sm text-muted-foreground">
          Ručna kontrola pristupa i AI kredita (bez naplate u aplikaciji).
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

      <div>
        <p className="text-sm font-medium">Trenutno kredita</p>
        <p className="text-3xl font-bold tabular-nums">{credits}</p>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-medium">Dodaj ili oduzmi kredite</p>
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
