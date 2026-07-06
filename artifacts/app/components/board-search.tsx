"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STATUSES, STATUS_LABELS, type Status } from "@/lib/domain/tickets";

const ALL = "ALL";

export function BoardSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const setParam = React.useCallback(
    (key: string, value: string) => {
      const next = new URLSearchParams(params.toString());
      if (!value || value === ALL) next.delete(key);
      else next.set(key, value);
      const query = next.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  function onSearch(value: string) {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setParam("q", value.trim()), 300);
  }

  const status = params.get("status") ?? ALL;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => onSearch(e.target.value)}
          placeholder="Search by reference (FH-…) or keyword"
          className="h-9 pl-9"
        />
      </div>
      <Select
        value={status}
        onValueChange={(v) => setParam("status", v ?? ALL)}
      >
        <SelectTrigger className="h-9 w-full sm:w-44">
          <SelectValue>
            {(v: string) =>
              v === ALL ? "All statuses" : STATUS_LABELS[v as Status]
            }
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All statuses</SelectItem>
          {STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {STATUS_LABELS[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
