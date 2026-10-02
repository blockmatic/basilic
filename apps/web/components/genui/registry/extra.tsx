"use client";

import { type BaseComponentProps, useBoundProp } from "@json-render/react";
import { Calendar } from "@repo/ui/components/calendar";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@repo/ui/components/chart";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@repo/ui/components/combobox";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@repo/ui/components/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@repo/ui/components/item";
import { Kbd } from "@repo/ui/components/kbd";
import { Label } from "@repo/ui/components/label";
import {
  NativeSelect,
  NativeSelectOption,
} from "@repo/ui/components/native-select";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  XAxis,
} from "recharts";

import type { CommandComponentProps } from "@/lib/genui/catalog/definitions";

export const extraComponents = {
  Kbd: ({ props }: BaseComponentProps<CommandComponentProps<"Kbd">>) => (
    <Kbd>{props.keys}</Kbd>
  ),

  Empty: ({ props }: BaseComponentProps<CommandComponentProps<"Empty">>) => (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>{props.title}</EmptyTitle>
        {props.description ? (
          <EmptyDescription>{props.description}</EmptyDescription>
        ) : null}
      </EmptyHeader>
    </Empty>
  ),

  Item: ({ props }: BaseComponentProps<CommandComponentProps<"Item">>) => (
    <Item>
      <ItemContent>
        <ItemTitle>{props.title}</ItemTitle>
        {props.description ? (
          <ItemDescription>{props.description}</ItemDescription>
        ) : null}
      </ItemContent>
    </Item>
  ),

  Chart: ({ props }: BaseComponentProps<CommandComponentProps<"Chart">>) => {
    const labels = props.labels ?? [];
    const series = props.series ?? [];
    const chartType = props.type ?? "bar";
    const data = labels.map((label, index) => {
      const row: Record<string, string | number> = { label };
      for (const entry of series) {
        row[entry.name] = entry.values[index] ?? 0;
      }
      return row;
    });
    const config = Object.fromEntries(
      series.map((entry, index) => [
        entry.name,
        { label: entry.name, color: `var(--chart-${(index % 5) + 1})` },
      ])
    );

    return (
      <ChartContainer className="min-h-[200px] w-full" config={config}>
        {chartType === "line" ? (
          <LineChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {series.map((entry) => (
              <Line
                dataKey={entry.name}
                key={entry.name}
                stroke={`var(--color-${entry.name})`}
                type="monotone"
              />
            ))}
          </LineChart>
        ) : null}
        {chartType === "area" ? (
          <AreaChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {series.map((entry) => (
              <Area
                dataKey={entry.name}
                fill={`var(--color-${entry.name})`}
                key={entry.name}
                stroke={`var(--color-${entry.name})`}
                type="monotone"
              />
            ))}
          </AreaChart>
        ) : null}
        {chartType === "bar" ? (
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            {series.map((entry) => (
              <Bar
                dataKey={entry.name}
                fill={`var(--color-${entry.name})`}
                key={entry.name}
                radius={4}
              />
            ))}
          </BarChart>
        ) : null}
      </ChartContainer>
    );
  },

  NativeSelect: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"NativeSelect">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState(props.options[0] ?? "");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const options = props.options ?? [];

    return (
      <div className="space-y-2">
        <Label>{props.label}</Label>
        <NativeSelect
          name={props.name}
          onChange={(event) => {
            setValue(event.target.value);
            emit("change");
          }}
          value={value}
        >
          {options.map((option) => (
            <NativeSelectOption key={option} value={option}>
              {option}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>
    );
  },

  Combobox: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Combobox">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const [localValue, setLocalValue] = useState("");
    const isBound = !!bindings?.value;
    const value = isBound ? (boundValue ?? "") : localValue;
    const setValue = isBound ? setBoundValue : setLocalValue;
    const options = props.options ?? [];

    return (
      <div className="space-y-2">
        <Label>{props.label}</Label>
        <Combobox
          onValueChange={(next) => {
            setValue(next ?? "");
            emit("change");
          }}
          value={value}
        >
          <ComboboxInput placeholder={props.placeholder ?? "Search..."} />
          <ComboboxContent>
            <ComboboxList>
              <ComboboxEmpty>No results</ComboboxEmpty>
              {options.map((option) => (
                <ComboboxItem key={option} value={option}>
                  {option}
                </ComboboxItem>
              ))}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </div>
    );
  },

  Calendar: ({
    props,
    bindings,
    emit,
  }: BaseComponentProps<CommandComponentProps<"Calendar">>) => {
    const [boundValue, setBoundValue] = useBoundProp<string>(
      props.value as string | undefined,
      bindings?.value
    );
    const selected = boundValue ? new Date(boundValue) : undefined;

    return (
      <div className="space-y-2">
        {props.label ? <Label>{props.label}</Label> : null}
        <Calendar
          mode="single"
          onSelect={(date) => {
            const iso = date?.toISOString().slice(0, 10) ?? "";
            setBoundValue(iso);
            emit("change");
          }}
          selected={selected}
        />
      </div>
    );
  },
};
