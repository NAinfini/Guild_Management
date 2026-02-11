"use client";
import { cn } from "@/lib/utils";

import * as React from "react";


function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      data-ui="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        data-ui="table"
        className={cn("ui-table w-full caption-bottom text-sm", className)}
        style={{
          borderColor: "var(--cmp-table-border)",
          color: "var(--sys-text-primary)",
        }}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      data-ui="table-header"
      className={cn("[&_tr]:border-b [&_tr]:border-[color:var(--cmp-table-border)]", className)}
      style={{
        backgroundColor: "var(--cmp-table-header-bg)",
      }}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      data-ui="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      data-ui="table-footer"
      className={cn(
        "border-t border-[color:var(--cmp-table-border)] font-medium [&>tr]:last:border-b-0",
        className,
      )}
      style={{ backgroundColor: "var(--cmp-table-header-bg)" }}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      data-ui="table-row"
      className={cn(
        "border-b border-[color:var(--cmp-table-border)] transition-colors hover:bg-[color:var(--cmp-table-row-hover-bg)] data-[state=selected]:bg-[color:var(--cmp-table-row-hover-bg)]",
        className,
      )}
      style={{ backgroundColor: "var(--cmp-table-row-bg)" }}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      data-ui="table-head"
      className={cn(
        "h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      style={{ color: "var(--sys-text-secondary)" }}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      data-ui="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      data-ui="table-caption"
      className={cn("mt-4 text-sm", className)}
      style={{ color: "var(--sys-text-secondary)" }}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
