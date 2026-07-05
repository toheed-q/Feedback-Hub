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
import {
  CATEGORIES,
  CATEGORY_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  STATUSES,
  STATUS_LABELS,
} from "@/lib/domain/tickets";

const ALL = "ALL";

type Option = readonly [value: string, label: string];

function FilterSelect({
  value,
  onChange,
  allLabel,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: readonly Option[];
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? ALL)}>
      <SelectTrigger className="h-9 w-full sm:w-40">
        <SelectValue>
          {(v: string) =>
            v === ALL
              ? allLabel
              : (options.find((o) => o[0] === v)?.[1] ?? allLabel)
          }
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>{allLabel}</SelectItem>
        {options.map(([val, label]) => (
          <SelectItem key={val} value={val}>
            {label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function TicketFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const searchTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

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

  function onSearchChange(value: string) {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setParam("q", value.trim()), 300);
  }

  const statusOptions = STATUSES.map(
    (s) => [s, STATUS_LABELS[s]] as Option,
  );
  const categoryOptions = CATEGORIES.map(
    (c) => [c, CATEGORY_LABELS[c]] as Option,
  );
  const priorityOptions = PRIORITIES.map(
    (p) => [p, PRIORITY_LABELS[p]] as Option,
  );

  return (
    <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          defaultValue={params.get("q") ?? ""}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search tickets…"
          className="h-9 pl-9"
        />
      </div>
      <FilterSelect
        value={params.get("status") ?? ALL}
        onChange={(v) => setParam("status", v)}
        allLabel="All statuses"
        options={statusOptions}
      />
      <FilterSelect
        value={params.get("category") ?? ALL}
        onChange={(v) => setParam("category", v)}
        allLabel="All categories"
        options={categoryOptions}
      />
      <FilterSelect
        value={params.get("priority") ?? ALL}
        onChange={(v) => setParam("priority", v)}
        allLabel="All priorities"
        options={priorityOptions}
      />
    </div>
  );
}
