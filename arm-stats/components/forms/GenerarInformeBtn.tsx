"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { PlusCircle, Loader2 } from "lucide-react";

export default function GenerarInformeBtn() {
  const [isPending, startTransition] = useTransition();

  function generate() {
    startTransition(async () => {
      // En producción: llamar server action que consolida datos de la semana
      await new Promise((r) => setTimeout(r, 1000));
      toast.success("Informe generado correctamente");
    });
  }

  return (
    <button className="btn-primary" disabled={isPending} onClick={generate}>
      {isPending ? (
        <Loader2 size={14} className="animate-spin" />
      ) : (
        <PlusCircle size={14} />
      )}
      Generar informe semanal
    </button>
  );
}
