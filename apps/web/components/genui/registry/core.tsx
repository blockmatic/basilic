"use client";

import {
  useBoundProp,
  useStateBinding,
  useFieldValidation,
  type BaseComponentProps,
} from "@json-render/react";
import {
  Accordion as AccordionPrimitive,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@repo/ui/components/accordion";
import { Alert, AlertTitle, AlertDescription } from "@repo/ui/components/alert";
import {
  Avatar as AvatarPrimitive,
  AvatarImage,
  AvatarFallback,
} from "@repo/ui/components/avatar";
import { Badge } from "@repo/ui/components/badge";
import { Button } from "@repo/ui/components/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { Checkbox } from "@repo/ui/components/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@repo/ui/components/collapsible";
import {
  Dialog as DialogPrimitive,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@repo/ui/components/dialog";
import {
  Drawer as DrawerPrimitive,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from "@repo/ui/components/drawer";
import {
  DropdownMenu as DropdownMenuPrimitive,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@repo/ui/components/dropdown-menu";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import {
  Pagination as PaginationPrimitive,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@repo/ui/components/pagination";
import {
  Popover as PopoverPrimitive,
  PopoverContent,
  PopoverTrigger,
} from "@repo/ui/components/popover";
import { Progress } from "@repo/ui/components/progress";
import { RadioGroup, RadioGroupItem } from "@repo/ui/components/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@repo/ui/components/select";
import { Separator } from "@repo/ui/components/separator";
import { Skeleton } from "@repo/ui/components/skeleton";
import { Slider } from "@repo/ui/components/slider";
import { Switch } from "@repo/ui/components/switch";
import {
  Table as TablePrimitive,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@repo/ui/components/table";
import {
  Tabs as TabsPrimitive,
  TabsList,
  TabsTrigger,
} from "@repo/ui/components/tabs";
import { Textarea } from "@repo/ui/components/textarea";
import { Toggle } from "@repo/ui/components/toggle";
import { ToggleGroup, ToggleGroupItem } from "@repo/ui/components/toggle-group";
import {
  Tooltip as TooltipPrimitive,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@repo/ui/components/tooltip";
import { cn } from "@repo/ui/lib/utils";
import { useState } from "react";

import type { CommandComponentProps } from "@/lib/genui/catalog/definitions";

// =============================================================================
// Helpers
// =============================================================================

function getPaginationRange(
  current: number,
  total: number
): Array<number | "ellipsis"> {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: Array<number | "ellipsis"> = [];
  pages.push(1);
  if (current > 3) {
    pages.push("ellipsis");
  }
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }
  if (current < total - 2) {
    pages.push("ellipsis");
  }
  pages.push(total);
  return pages;
}

// =============================================================================
// Standard Component Implementations
// =============================================================================

export const coreComponents = {
  // ── Layout ────────────────────────────────────────────────────────────

  Card: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Card">>) => {
    const maxWidthClass =
      props.maxWidth === "sm"
        ? "max-w-xs sm:min-w-[280px]"
        : props.maxWidth === "md"
          ? "max-w-sm sm:min-w-[320px]"
          : props.maxWidth === "lg"
            ? "max-w-md sm:min-w-[360px]"
            : "w-full";
    const centeredClass = props.centered ? "mx-auto" : "";

    return (
      <Card className={cn(maxWidthClass, centeredClass, props.className)}>
        {(props.title || props.description) && (
          <CardHeader>
            {props.title && <CardTitle>{props.title}</CardTitle>}
            {props.description && (
              <CardDescription>{props.description}</CardDescription>
            )}
          </CardHeader>
        )}
        <CardContent className="flex flex-col gap-3">{children}</CardContent>
      </Card>
    );
  },

  Stack: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Stack">>) => {
    const isHorizontal = props.direction === "horizontal";
    const gapMap: Record<string, string> = {
      none: "gap-0",
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    };
    const alignMap: Record<string, string> = {
      start: "items-start",
      center: "items-center",
      end: "items-end",
      stretch: "items-stretch",
    };
    const justifyMap: Record<string, string> = {
      start: "",
      center: "justify-center",
      end: "justify-end",
      between: "justify-between",
      around: "justify-around",
    };

    const gapClass = gapMap[props.gap ?? "md"] ?? "gap-3";
    const alignClass = alignMap[props.align ?? "start"] ?? "items-start";
    const justifyClass = justifyMap[props.justify ?? ""] ?? "";

    return (
      <div
        className={cn(
          "flex",
          isHorizontal ? "flex-row flex-wrap" : "flex-col",
          gapClass,
          alignClass,
          justifyClass,
          props.className
        )}
      >
        {children}
      </div>
    );
  },

  Grid: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Grid">>) => {
    const colsMap: Record<number, string> = {
      1: "grid-cols-1",
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-4",
      5: "grid-cols-5",
      6: "grid-cols-6",
    };
    const gridGapMap: Record<string, string> = {
      sm: "gap-2",
      md: "gap-3",
      lg: "gap-4",
      xl: "gap-6",
    };

    const n = Math.max(1, Math.min(6, props.columns ?? 1));
    const cols = colsMap[n] ?? "grid-cols-1";
    const gridGap = gridGapMap[props.gap ?? "md"] ?? "gap-3";

    return (
      <div className={cn("grid", cols, gridGap, props.className)}>
        {children}
      </div>
    );
  },

  Separator: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Separator">>) => {
    return (
      <Separator
        orientation={props.orientation ?? "horizontal"}
        className={props.orientation === "vertical" ? "mx-2 h-full" : "my-3"}
      />
    );
  },

  Tabs: ({
    props,
    children,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Tabs">>) => {
    const tabs = props.tabs ?? [];
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState(
      props.defaultValue ?? tabs[0]?.value ?? ""
    );
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? tabs[0]?.value ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <TabsPrimitive
        value={value}
        onValueChange={(v) => {
          setValue(v);
          emit("change");
        }}
      >
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {children}
      </TabsPrimitive>
    );
  },

  Accordion: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Accordion">>) => {
    const items = props.items ?? [];
    const isMultiple = props.type === "multiple";

    const itemElements = items.map((item, i) => (
      <AccordionItem key={i} value={`item-${i}`}>
        <AccordionTrigger>{item.title}</AccordionTrigger>
        <AccordionContent>{item.content}</AccordionContent>
      </AccordionItem>
    ));

    return (
      <AccordionPrimitive className="w-full" multiple={isMultiple}>
        {itemElements}
      </AccordionPrimitive>
    );
  },

  Collapsible: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Collapsible">>) => {
    const [open, setOpen] = useState(props.defaultOpen ?? false);
    return (
      <Collapsible open={open} onOpenChange={setOpen} className="w-full">
        <CollapsibleTrigger className="border-border hover:bg-muted flex w-full items-center justify-between rounded-md border px-4 py-2 text-sm font-medium transition-colors">
          {props.title}
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-2">{children}</CollapsibleContent>
      </Collapsible>
    );
  },

  Dialog: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Dialog">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <DialogPrimitive open={open ?? false} onOpenChange={(v) => setOpen(v)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{props.title}</DialogTitle>
            {props.description && (
              <DialogDescription>{props.description}</DialogDescription>
            )}
          </DialogHeader>
          {children}
        </DialogContent>
      </DialogPrimitive>
    );
  },

  Drawer: ({
    props,
    children,
  }: BaseComponentProps<CommandComponentProps<"Drawer">>) => {
    const [open, setOpen] = useStateBinding<boolean>(props.openPath ?? "");
    return (
      <DrawerPrimitive open={open ?? false} onOpenChange={(v) => setOpen(v)}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{props.title}</DrawerTitle>
            {props.description && (
              <DrawerDescription>{props.description}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="p-4">{children}</div>
        </DrawerContent>
      </DrawerPrimitive>
    );
  },

  // ── Data Display ──────────────────────────────────────────────────────

  Table: ({ props }: BaseComponentProps<CommandComponentProps<"Table">>) => {
    const columns = props.columns ?? [];
    const rows = (props.rows ?? []).map((row) => row.map(String));

    return (
      <div className="border-border overflow-hidden rounded-md border">
        <TablePrimitive>
          {props.caption && <TableCaption>{props.caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i}>
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </TablePrimitive>
      </div>
    );
  },

  Heading: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Heading">>) => {
    const level = props.level ?? "h2";
    const headingClass =
      level === "h1"
        ? "text-2xl font-bold"
        : level === "h3"
          ? "text-base font-semibold"
          : level === "h4"
            ? "text-sm font-semibold"
            : "text-lg font-semibold";

    if (level === "h1")
      return <h1 className={`${headingClass} text-left`}>{props.text}</h1>;
    if (level === "h3")
      return <h3 className={`${headingClass} text-left`}>{props.text}</h3>;
    if (level === "h4")
      return <h4 className={`${headingClass} text-left`}>{props.text}</h4>;
    return <h2 className={`${headingClass} text-left`}>{props.text}</h2>;
  },

  Text: ({ props }: BaseComponentProps<CommandComponentProps<"Text">>) => {
    const textClass =
      props.variant === "caption"
        ? "text-xs"
        : props.variant === "muted"
          ? "text-sm text-muted-foreground"
          : props.variant === "lead"
            ? "text-xl text-muted-foreground"
            : props.variant === "code"
              ? "font-mono text-sm bg-muted px-1.5 py-0.5 rounded"
              : "text-sm";

    if (props.variant === "code") {
      return <code className={`${textClass} text-left`}>{props.text}</code>;
    }
    return <p className={`${textClass} text-left`}>{props.text}</p>;
  },

  Avatar: ({ props }: BaseComponentProps<CommandComponentProps<"Avatar">>) => {
    const name = props.name || "?";
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
    const sizeClass =
      props.size === "lg"
        ? "h-12 w-12"
        : props.size === "sm"
          ? "h-8 w-8"
          : "h-10 w-10";

    return (
      <AvatarPrimitive className={sizeClass}>
        {props.src && <AvatarImage src={props.src} alt={name} />}
        <AvatarFallback>{initials}</AvatarFallback>
      </AvatarPrimitive>
    );
  },

  Badge: ({ props }: BaseComponentProps<CommandComponentProps<"Badge">>) => {
    return <Badge variant={props.variant ?? "default"}>{props.text}</Badge>;
  },

  Alert: ({ props }: BaseComponentProps<CommandComponentProps<"Alert">>) => {
    const variant = props.type === "error" ? "destructive" : "default";
    const customClass =
      props.type === "success"
        ? "border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100"
        : props.type === "warning"
          ? "border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100"
          : props.type === "info"
            ? "border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100"
            : "";

    return (
      <Alert variant={variant} className={customClass}>
        <AlertTitle>{props.title}</AlertTitle>
        {props.message && <AlertDescription>{props.message}</AlertDescription>}
      </Alert>
    );
  },

  Progress: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Progress">>) => {
    const value = Math.min(100, Math.max(0, props.value || 0));
    return (
      <div className="space-y-2">
        {props.label && (
          <Label className="text-muted-foreground text-sm">{props.label}</Label>
        )}
        <Progress value={value} />
      </div>
    );
  },

  Skeleton: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Skeleton">>) => {
    return (
      <Skeleton
        className={props.rounded ? "rounded-full" : "rounded-md"}
        style={{
          width: props.width ?? "100%",
          height: props.height ?? "1.25rem",
        }}
      />
    );
  },

  Spinner: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Spinner">>) => {
    const sizeClass =
      props.size === "lg"
        ? "h-8 w-8"
        : props.size === "sm"
          ? "h-4 w-4"
          : "h-6 w-6";
    return (
      <div className="flex items-center gap-2">
        <svg
          className={`${sizeClass} text-muted-foreground animate-spin`}
          viewBox="0 0 24 24"
          fill="none"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        {props.label && (
          <span className="text-muted-foreground text-sm">{props.label}</span>
        )}
      </div>
    );
  },

  Tooltip: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Tooltip">>) => {
    return (
      <TooltipProvider>
        <TooltipPrimitive>
          <TooltipTrigger>
            <span className="cursor-help text-sm underline decoration-dotted">
              {props.text}
            </span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{props.content}</p>
          </TooltipContent>
        </TooltipPrimitive>
      </TooltipProvider>
    );
  },

  Popover: ({
    props,
  }: BaseComponentProps<CommandComponentProps<"Popover">>) => {
    return (
      <PopoverPrimitive>
        <PopoverTrigger>
          <Button variant="outline" className="text-sm">
            {props.trigger}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <p className="text-sm">{props.content}</p>
        </PopoverContent>
      </PopoverPrimitive>
    );
  },

  // ── Form Inputs ───────────────────────────────────────────────────────

  Input: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Input">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "blur";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined
    );

    return (
      <div className="space-y-2">
        {props.label && (
          <Label htmlFor={props.name ?? undefined}>{props.label}</Label>
        )}
        <Input
          id={props.name ?? undefined}
          name={props.name ?? undefined}
          type={props.type ?? "text"}
          placeholder={props.placeholder ?? ""}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") emit("submit");
          }}
          onFocus={() => emit("focus")}
          onBlur={() => {
            if (hasValidation && validateOn === "blur") validate();
            emit("blur");
          }}
        />
        {errors.length > 0 && (
          <p className="text-destructive text-sm">{errors[0]}</p>
        )}
      </div>
    );
  },

  Textarea: ({
    props,
    bindings,
  }: BaseComponentProps<CommandComponentProps<"Textarea">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const validateOn = props.validateOn ?? "blur";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined
    );

    return (
      <div className="space-y-2">
        {props.label && (
          <Label htmlFor={props.name ?? undefined}>{props.label}</Label>
        )}
        <Textarea
          id={props.name ?? undefined}
          name={props.name ?? undefined}
          placeholder={props.placeholder ?? ""}
          rows={props.rows ?? 3}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (hasValidation && validateOn === "change") validate();
          }}
          onBlur={() => {
            if (hasValidation && validateOn === "blur") validate();
          }}
        />
        {errors.length > 0 && (
          <p className="text-destructive text-sm">{errors[0]}</p>
        )}
      </div>
    );
  },

  Select: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Select">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState<string>("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? "")
    );
    const validateOn = props.validateOn ?? "change";

    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined
    );

    return (
      <div className="space-y-2">
        <Label>{props.label}</Label>
        <Select
          value={value}
          onValueChange={(v) => {
            setValue(v ?? "");
            // Select has no native blur event, so only validate on "change"
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={props.placeholder ?? "Select..."} />
          </SelectTrigger>
          <SelectContent>
            {options.map((opt, idx) => (
              <SelectItem key={`${idx}-${opt}`} value={opt || `option-${idx}`}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.length > 0 && (
          <p className="text-destructive text-sm">{errors[0]}</p>
        )}
      </div>
    );
  },

  Checkbox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Checkbox">>) => {
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      props.checked as boolean | undefined,
      bindings?.checked
    );
    const [localChecked, setLocalChecked] = useState(!!props.checked);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;

    const validateOn = props.validateOn ?? "change";
    const hasValidation = !!(bindings?.checked && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.checked ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined
    );

    return (
      <div className="space-y-1">
        <div className="flex items-center space-x-2">
          <Checkbox
            id={props.name ?? undefined}
            checked={checked}
            onCheckedChange={(c) => {
              setChecked(c === true);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
          />
          <Label htmlFor={props.name ?? undefined} className="cursor-pointer">
            {props.label}
          </Label>
        </div>
        {errors.length > 0 && (
          <p className="text-destructive text-sm">{errors[0]}</p>
        )}
      </div>
    );
  },

  RadioGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"RadioGroup">>) => {
    const rawOptions = props.options ?? [];
    const options = rawOptions.map((opt) =>
      typeof opt === "string" ? opt : String(opt ?? "")
    );
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState(options[0] ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    const validateOn = props.validateOn ?? "change";
    const hasValidation = !!(bindings?.value && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.value ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined
    );

    return (
      <div className="space-y-2">
        {props.label && <Label>{props.label}</Label>}
        <RadioGroup
          value={value}
          onValueChange={(v) => {
            setValue(v);
            if (hasValidation && validateOn === "change") validate();
            emit("change");
          }}
        >
          {options.map((opt, idx) => (
            <div key={`${idx}-${opt}`} className="flex items-center space-x-2">
              <RadioGroupItem
                value={opt || `option-${idx}`}
                id={`${props.name}-${idx}-${opt}`}
              />
              <Label
                htmlFor={`${props.name}-${idx}-${opt}`}
                className="cursor-pointer"
              >
                {opt}
              </Label>
            </div>
          ))}
        </RadioGroup>
        {errors.length > 0 && (
          <p className="text-destructive text-sm">{errors[0]}</p>
        )}
      </div>
    );
  },

  Switch: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Switch">>) => {
    const [boundChecked, setBoundChecked] = useBoundProp<boolean>(
      props.checked as boolean | undefined,
      bindings?.checked
    );
    const [localChecked, setLocalChecked] = useState(!!props.checked);
    const isBound = !!bindings?.checked;
    const checked = isBound ? (boundChecked ?? false) : localChecked;
    const setChecked = isBound ? setBoundChecked : setLocalChecked;

    const validateOn = props.validateOn ?? "change";
    const hasValidation = !!(bindings?.checked && props.checks?.length);
    const { errors, validate } = useFieldValidation(
      bindings?.checked ?? "",
      hasValidation ? { checks: props.checks ?? [], validateOn } : undefined
    );

    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor={props.name ?? undefined} className="cursor-pointer">
            {props.label}
          </Label>
          <Switch
            id={props.name ?? undefined}
            checked={checked}
            onCheckedChange={(c) => {
              setChecked(c);
              if (hasValidation && validateOn === "change") validate();
              emit("change");
            }}
          />
        </div>
        {errors.length > 0 && (
          <p className="text-destructive text-sm">{errors[0]}</p>
        )}
      </div>
    );
  },

  Slider: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Slider">>) => {
    const [boundValue, setBoundValue] = useBoundProp<number>(
      props.value as number | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState(props.min ?? 0);
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? props.min ?? 0) : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    return (
      <div className="space-y-2">
        {props.label && (
          <div className="flex justify-between">
            <Label className="text-sm">{props.label}</Label>
            <span className="text-muted-foreground text-sm">{value}</span>
          </div>
        )}
        <Slider
          value={[value]}
          min={props.min ?? 0}
          max={props.max ?? 100}
          step={props.step ?? 1}
          onValueChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v;
            setValue(typeof next === "number" ? next : 0);
            emit("change");
          }}
        />
      </div>
    );
  },

  // ── Actions ───────────────────────────────────────────────────────────

  Button: ({
    props,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Button">>) => {
    const variant =
      props.variant === "danger"
        ? "destructive"
        : props.variant === "secondary"
          ? "secondary"
          : "default";

    return (
      <Button
        variant={variant}
        disabled={props.disabled ?? false}
        onClick={() => emit("press")}
      >
        {props.label}
      </Button>
    );
  },

  DropdownMenu: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"DropdownMenu">>) => {
    const items = props.items ?? [];
    const [, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    return (
      <DropdownMenuPrimitive>
        <DropdownMenuTrigger>
          <Button variant="outline">{props.label}</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {items.map((item) => (
            <DropdownMenuItem
              key={item.value}
              onClick={() => {
                setBoundValue(item.value);
                emit("select");
              }}
            >
              {item.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPrimitive>
    );
  },

  Toggle: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Toggle">>) => {
    const [boundPressed, setBoundPressed] = useBoundProp<boolean>(
      props.pressed as boolean | undefined,
      bindings?.pressed
    );
    const [localPressed, setLocalPressed] = useState(props.pressed ?? false);
    const isBound = !!bindings?.pressed;
    const pressed = isBound ? (boundPressed ?? false) : localPressed;
    const setPressed = isBound ? setBoundPressed : setLocalPressed;

    return (
      <Toggle
        variant={props.variant ?? "default"}
        pressed={pressed}
        onPressedChange={(v) => {
          setPressed(v);
          emit("change");
        }}
      >
        {props.label}
      </Toggle>
    );
  },

  ToggleGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"ToggleGroup">>) => {
    const type = props.type ?? "single";
    const items = props.items ?? [];
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState(items[0]?.value ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;

    if (type === "multiple") {
      const selected = value ? value.split(",").filter(Boolean) : [];
      return (
        <ToggleGroup
          multiple
          onValueChange={(next) => {
            setValue(next.join(","));
            emit("change");
          }}
          value={selected}
        >
          {items.map((item) => (
            <ToggleGroupItem key={item.value} value={item.value}>
              {item.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      );
    }

    return (
      <ToggleGroup
        onValueChange={(next) => {
          const picked = next[0];
          if (picked) {
            setValue(picked);
            emit("change");
          }
        }}
        value={value ? [value] : []}
      >
        {items.map((item) => (
          <ToggleGroupItem key={item.value} value={item.value}>
            {item.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    );
  },

  ButtonGroup: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"ButtonGroup">>) => {
    const buttons = props.buttons ?? [];
    const [boundSelected, setBoundSelected] = useBoundProp<string>(
      props.selected as string | undefined,
      bindings?.selected
    );
    const [localValue, setLocalValue] = useState(buttons[0]?.value ?? "");
    const isBound = !!bindings?.selected;
    const value = isBound ? (boundSelected ?? "") : localValue;
    const setValue = isBound ? setBoundSelected : setLocalValue;

    return (
      <div className="border-border inline-flex rounded-md border">
        {buttons.map((btn, i) => (
          <button
            key={btn.value}
            className={`px-3 py-1.5 text-sm transition-colors ${
              value === btn.value
                ? "bg-primary text-primary-foreground"
                : "bg-background hover:bg-muted"
            } ${i > 0 ? "border-border border-l" : ""} ${
              i === 0 ? "rounded-l-md" : ""
            } ${i === buttons.length - 1 ? "rounded-r-md" : ""}`}
            onClick={() => {
              setValue(btn.value);
              emit("change");
            }}
          >
            {btn.label}
          </button>
        ))}
      </div>
    );
  },

  Pagination: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Pagination">>) => {
    const [boundPage, setBoundPage] = useBoundProp<number>(
      props.page as number | undefined,
      bindings?.page
    );
    const currentPage = boundPage ?? 1;
    const totalPages = props.totalPages ?? 1;
    const pages = getPaginationRange(currentPage, totalPages);

    return (
      <PaginationPrimitive>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage > 1) {
                  setBoundPage(currentPage - 1);
                  emit("change");
                }
              }}
            />
          </PaginationItem>
          {pages.map((page, idx) =>
            page === "ellipsis" ? (
              <PaginationItem key={`ellipsis-${idx}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={page}>
                <PaginationLink
                  href="#"
                  isActive={page === currentPage}
                  onClick={(e) => {
                    e.preventDefault();
                    setBoundPage(page);
                    emit("change");
                  }}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          )}
          <PaginationItem>
            <PaginationNext
              href="#"
              onClick={(e) => {
                e.preventDefault();
                if (currentPage < totalPages) {
                  setBoundPage(currentPage + 1);
                  emit("change");
                }
              }}
            />
          </PaginationItem>
        </PaginationContent>
      </PaginationPrimitive>
    );
  },
};
