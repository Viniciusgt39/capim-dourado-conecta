import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { MapPin, Navigation, Share2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getCustomerReservations } from "@/features/reservations/functions";
import { buildVisit, entrances, validEntrance, type Entrance } from "./model";
import { toast } from "sonner";

export function VisitPage({ initialEntrance }: { initialEntrance?: string | undefined }) {
  const [entrance, setEntrance] = useState<Entrance>(validEntrance(initialEntrance));
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const fromQr = initialEntrance ?? sessionStorage.getItem("capim-entrance");
    setEntrance(validEntrance(fromQr));
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, [initialEntrance]);
  const {
    data: reservations = [],
    error,
    isPending,
  } = useQuery({
    queryKey: ["customer-reservations"],
    queryFn: () => getCustomerReservations(),
    refetchInterval: 30_000,
  });
  const route = buildVisit(reservations, entrance, now);
  function select(value: Entrance) {
    setEntrance(value);
    sessionStorage.setItem("capim-entrance", value);
  }
  async function share() {
    const text = `Roteiro ilustrativo — ${entrances.find((e) => e.id === entrance)?.name}: ${route.map((s) => `${s.name} (${s.code})`).join(" → ")}. Não é uma planta real do shopping.`;
    try {
      if (navigator.share)
        await navigator.share({ title: "Minha visita — Capim Dourado Connect", text });
      else {
        await navigator.clipboard.writeText(text);
        toast.success("Roteiro copiado.");
      }
    } catch {
      toast.info("Compartilhamento não concluído.");
    }
  }
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-8">
      <p className="eyebrow text-primary">Do digital ao presencial</p>
      <h1 className="editorial-title mt-3 text-5xl">Minha visita</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Rota fictícia · Não use como orientação física no shopping.
      </p>
      <div className="mt-7 flex flex-wrap gap-2" aria-label="Entrada do shopping">
        {entrances.map((e) => (
          <Button
            key={e.id}
            variant={entrance === e.id ? "default" : "outline"}
            className="h-11"
            onClick={() => select(e.id)}
            aria-pressed={entrance === e.id}
          >
            <MapPin />
            {e.name}
          </Button>
        ))}
      </div>
      <section className="mt-7 grid gap-8 md:grid-cols-2">
        <div
          className="relative min-h-72 rounded-lg border bg-surface p-5"
          aria-label="Planta ilustrativa"
        >
          <p className="text-xs font-semibold text-muted-foreground">GALERIA FICTÍCIA</p>
          <div className="mt-8 flex justify-between text-xs text-primary">
            <span>Norte</span>
            <span>Leste</span>
            <span>Sul</span>
          </div>
          <div className="relative mt-4 h-40 border-y-8 border-primary/30">
            <div className="absolute inset-x-0 top-1/2 border-t-2 border-dashed border-primary" />
            <div className="absolute left-[20%] top-4 bg-card p-3 text-xs">
              <ShoppingBag className="mb-1 h-5 w-5 text-primary" />
              Movida
            </div>
            <div className="absolute right-[15%] bottom-4 bg-card p-3 text-xs">
              <ShoppingBag className="mb-1 h-5 w-5 text-primary" />
              Essenza
            </div>
          </div>
        </div>
        <div>
          {error && (
            <p role="alert" className="text-destructive">
              {error.message}
            </p>
          )}
          {isPending ? (
            <p>Carregando reservas…</p>
          ) : route.length === 0 ? (
            <div className="py-8">
              <Navigation className="h-7 w-7 text-primary" />
              <h2 className="mt-3 font-display text-3xl">Nenhuma parada ativa</h2>
              <Button asChild variant="outline" className="mt-4">
                <Link to="/app">Explorar produtos</Link>
              </Button>
            </div>
          ) : (
            <>
              <h2 className="font-display text-3xl">Seu caminho</h2>
              <ol className="mt-5 space-y-5">
                {route.map((s, i) => (
                  <li key={s.id} className="flex gap-3 border-b pb-4">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm text-primary-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <h3 className="font-semibold">{s.name}</h3>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {s.location_label} · {s.minutes} min ilustrativos
                      </p>
                      <p className="mt-1 text-xs">
                        Código {s.code} ·{" "}
                        {s.status === "CONFIRMED" ? "Confirmada" : "Aguardando confirmação"}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
              <Button variant="outline" className="mt-5" onClick={share}>
                <Share2 />
                Compartilhar roteiro
              </Button>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
