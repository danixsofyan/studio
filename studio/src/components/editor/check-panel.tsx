"use client";

import { AlertCircle, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import type { Issue } from "@/lib/validate";
import { formatDuration } from "@/lib/format";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function CheckPanel({
  issues,
  totalDuration,
  sceneCount,
}: {
  issues: Issue[];
  totalDuration: number;
  sceneCount: number;
}) {
  const errors = issues.filter((i) => i.level === "error");
  const warnings = issues.filter((i) => i.level === "warning");
  const bersih = errors.length === 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {bersih ? (
            <ShieldCheck className="size-4 text-emerald-600" />
          ) : (
            <AlertCircle className="size-4 text-destructive" />
          )}
          Pemeriksaan
        </CardTitle>
        <CardDescription>
          {sceneCount} scene · {formatDuration(totalDuration)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-2">
          <Badge
            variant="secondary"
            className={errors.length ? "bg-destructive/10 text-destructive" : "bg-emerald-100 text-emerald-800"}
          >
            {errors.length} error
          </Badge>
          <Badge variant="secondary" className="bg-amber-100 text-amber-900">
            {warnings.length} peringatan
          </Badge>
        </div>

        {issues.length === 0 ? (
          <div className="flex items-start gap-2 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-900">
            <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
            <span>Semua siap. Struktur scene, footage, dan judul sudah lengkap.</span>
          </div>
        ) : (
          <ul className="max-h-64 space-y-2 overflow-y-auto pr-1 text-[11px] leading-relaxed">
            {[...errors, ...warnings].map((issue, i) => (
              <li key={i} className="flex items-start gap-2">
                {issue.level === "error" ? (
                  <AlertCircle className="mt-0.5 size-3.5 shrink-0 text-destructive" />
                ) : (
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                )}
                <span className={issue.level === "error" ? "text-destructive" : "text-amber-900"}>
                  {issue.message}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
