import type { Spec } from "@json-render/core";

import { commandCatalog } from "./catalog";

const minimalPropsByType: Record<string, Record<string, unknown>> = {
  Accordion: { items: [{ title: "A", content: "Body" }], type: "single" },
  Alert: { title: "Note", message: "Saved", type: "info" },
  AlertDialog: {
    title: "Confirm",
    description: "Continue?",
    openPath: "/ui/open",
    confirmLabel: "Yes",
    cancelLabel: "No",
  },
  Attachment: { name: "file.pdf", url: null, sizeLabel: "1 MB" },
  Avatar: { name: "Jane Doe", src: null, size: "md" },
  Badge: { text: "Active", variant: "default" },
  Bubble: { text: "Hello", variant: "default", align: "start" },
  Button: { label: "Send", variant: "primary", disabled: false },
  ButtonGroup: {
    buttons: [{ label: "A", value: "a" }],
    selected: "a",
  },
  Calendar: { label: "Date", value: "2026-01-01" },
  Card: {
    title: "Card",
    description: null,
    maxWidth: "md",
    centered: false,
    className: null,
  },
  Chart: {
    type: "bar",
    labels: ["Jan", "Feb"],
    series: [{ name: "sales", values: [1, 2] }],
  },
  Checkbox: {
    label: "Agree",
    name: "agree",
    checked: false,
    checks: null,
    validateOn: null,
  },
  Collapsible: { title: "More", defaultOpen: false },
  Combobox: {
    label: "Pick",
    name: "pick",
    options: ["a", "b"],
    placeholder: "Search",
    value: "a",
  },
  Dialog: { title: "Dialog", description: null, openPath: "/ui/dialog" },
  Drawer: { title: "Drawer", description: null, openPath: "/ui/drawer" },
  DropdownMenu: {
    label: "Menu",
    items: [{ label: "One", value: "1" }],
    value: "1",
  },
  Empty: { title: "Nothing here", description: null },
  Grid: { columns: 2, gap: "md", className: null },
  Heading: { text: "Title", level: "h2" },
  Input: {
    label: "Email",
    name: "email",
    type: "email",
    placeholder: null,
    value: "",
    checks: null,
    validateOn: null,
  },
  Item: { title: "Row", description: null },
  Kbd: { keys: "⌘K" },
  Marker: { label: "Step 1" },
  Message: { align: "start", body: "Hi", author: "Bot" },
  NativeSelect: {
    label: "Role",
    name: "role",
    options: ["admin"],
    value: "admin",
  },
  Pagination: { totalPages: 3, page: 1 },
  Popover: { trigger: "Open", content: "Details" },
  Progress: { value: 40, max: 100, label: null },
  Questionnaire: {
    question: "Pick one",
    options: ["Yes", "No"],
    value: "Yes",
  },
  RadioGroup: {
    label: "Plan",
    name: "plan",
    options: ["free"],
    value: "free",
    checks: null,
    validateOn: null,
  },
  Select: {
    label: "Size",
    name: "size",
    options: ["s", "m"],
    placeholder: null,
    value: "s",
    checks: null,
    validateOn: null,
  },
  Separator: { orientation: "horizontal" },
  Sheet: {
    title: "Sheet",
    description: null,
    openPath: "/ui/sheet",
    side: "right",
  },
  Skeleton: { width: "100%", height: "1rem", rounded: false },
  Slider: { label: "Volume", min: 0, max: 100, step: 1, value: 50 },
  Spinner: { size: "md", label: null },
  Stack: {
    direction: "vertical",
    gap: "md",
    align: "start",
    justify: "start",
    className: null,
  },
  StatusCard: { database: true, name: "Basilic", ok: true },
  Switch: {
    label: "On",
    name: "on",
    checked: true,
    checks: null,
    validateOn: null,
  },
  Table: { columns: ["A"], rows: [["1"]], caption: null },
  Tabs: {
    tabs: [{ label: "One", value: "one" }],
    defaultValue: "one",
    value: "one",
  },
  Text: { text: "Body", variant: "body" },
  Textarea: {
    label: "Notes",
    name: "notes",
    placeholder: null,
    rows: 3,
    value: "",
    checks: null,
    validateOn: null,
  },
  Toggle: { label: "Bold", pressed: false, variant: "default" },
  ToggleGroup: {
    items: [{ label: "A", value: "a" }],
    type: "single",
    value: "a",
  },
  Tooltip: { content: "Tip", text: "Hover me" },
  UserInfo: { email: "a@b.com", image: null, name: "User" },
};

export function catalogFixtureSpec(): Spec {
  const elements: Spec["elements"] = {};
  let index = 0;
  for (const name of commandCatalog.componentNames) {
    const key = `el_${index}`;
    elements[key] = {
      children: [],
      type: name,
      props: minimalPropsByType[name] ?? {},
    };
    index += 1;
  }
  return {
    root: "el_0",
    elements,
  };
}
