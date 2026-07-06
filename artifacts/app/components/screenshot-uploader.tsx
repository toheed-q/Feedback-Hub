"use client";

import * as React from "react";
import { ImageIcon, Loader2, X, AlertCircle } from "lucide-react";

import { cn } from "@/lib/utils";

const ALLOWED = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_FILES = 5;

type Item = {
  id: string;
  name: string;
  previewUrl: string; // local object URL for instant preview
  url?: string; // remote URL once uploaded
  status: "uploading" | "done" | "error";
  error?: string;
};

export function ScreenshotUploader({
  onChange,
}: {
  onChange: (urls: string[]) => void;
}) {
  const [items, setItems] = React.useState<Item[]>([]);
  const [dragging, setDragging] = React.useState(false);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    onChange(
      items
        .filter((i) => i.status === "done" && i.url)
        .map((i) => i.url as string),
    );
  }, [items, onChange]);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList) return;
    const files = Array.from(fileList);

    for (const file of files) {
      setItems((prev) => {
        if (prev.length >= MAX_FILES) return prev;
        const id = crypto.randomUUID();

        if (!ALLOWED.includes(file.type)) {
          return [
            ...prev,
            { id, name: file.name, previewUrl: "", status: "error", error: "Unsupported file type" },
          ];
        }
        if (file.size > MAX_BYTES) {
          return [
            ...prev,
            { id, name: file.name, previewUrl: "", status: "error", error: "Larger than 5 MB" },
          ];
        }

        // Kick off the upload for this valid file.
        void uploadOne(id, file);
        return [
          ...prev,
          {
            id,
            name: file.name,
            previewUrl: URL.createObjectURL(file),
            status: "uploading",
          },
        ];
      });
    }

    if (inputRef.current) inputRef.current.value = "";
  }

  async function uploadOne(id: string, file: File) {
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setItems((prev) =>
          prev.map((i) =>
            i.id === id
              ? { ...i, status: "error", error: data?.error ?? "Upload failed" }
              : i,
          ),
        );
        return;
      }
      const { url } = (await res.json()) as { url: string };
      setItems((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: "done", url } : i)),
      );
    } catch {
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, status: "error", error: "Network error" } : i,
        ),
      );
    }
  }

  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="grid gap-3">
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="relative size-20 overflow-hidden rounded-lg border border-border bg-muted"
            >
              {item.status === "error" ? (
                <div className="flex size-full flex-col items-center justify-center gap-1 p-1 text-center">
                  <AlertCircle className="size-4 text-destructive" />
                  <span className="text-[10px] leading-tight text-muted-foreground">
                    {item.error}
                  </span>
                </div>
              ) : (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.previewUrl}
                    alt={item.name}
                    className="size-full object-cover"
                  />
                  {item.status === "uploading" && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60">
                      <Loader2 className="size-5 animate-spin text-foreground" />
                    </div>
                  )}
                </>
              )}
              <button
                type="button"
                onClick={() => remove(item.id)}
                aria-label="Remove image"
                className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-foreground/70 text-background transition-colors hover:bg-foreground"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {items.length < MAX_FILES && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed px-3 py-8 text-sm transition-colors",
            dragging
              ? "border-primary bg-primary/5 text-foreground"
              : "border-input text-muted-foreground hover:border-primary/40 hover:text-foreground",
          )}
        >
          <ImageIcon className="size-6 text-muted-foreground" />
          <span>
            Drop an image here, or{" "}
            <span className="font-medium text-primary">browse</span>
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED.join(",")}
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-xs text-muted-foreground">
        Optional. PNG, JPG, WEBP, or GIF up to 5 MB each — {MAX_FILES} max.
      </p>
    </div>
  );
}
