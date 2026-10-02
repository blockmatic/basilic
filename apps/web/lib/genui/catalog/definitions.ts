import { z } from "zod";

// =============================================================================
// Shared validation schemas used across form components
// =============================================================================

const validationCheckSchema = z
  .array(
    z.object({
      type: z.string(),
      message: z.string(),
      args: z.record(z.string(), z.unknown()).optional(),
    })
  )
  .nullable();

const validateOnSchema = z.enum(["change", "blur", "submit"]).nullable();

// =============================================================================
// shadcn/ui Component Definitions
// =============================================================================

/**
 * shadcn/ui component definitions for json-render catalogs.
 *
 * These can be used directly or extended with custom components.
 * All components are built using Radix UI primitives + Tailwind CSS.
 */
export const commandComponentDefinitions = {
  // ==========================================================================
  // Layout Components
  // ==========================================================================

  Card: {
    props: z.object({
      title: z.string().nullable(),
      description: z.string().nullable(),
      maxWidth: z.enum(["sm", "md", "lg", "full"]).nullable(),
      centered: z.boolean().nullable(),
      className: z.string().nullable().describe("Additional CSS classes"),
    }),
    slots: ["default"],
    description:
      "Container card for content sections. Use for forms/content boxes, NOT for page headers.",
    example: { title: "Overview", description: "Your account summary" },
  },

  Stack: {
    props: z.object({
      direction: z.enum(["horizontal", "vertical"]).nullable(),
      gap: z.enum(["none", "sm", "md", "lg", "xl"]).nullable(),
      align: z.enum(["start", "center", "end", "stretch"]).nullable(),
      justify: z
        .enum(["start", "center", "end", "between", "around"])
        .nullable(),
      className: z.string().nullable().describe("Additional CSS classes"),
    }),
    slots: ["default"],
    description: "Flex container for layouts",
    example: { direction: "vertical", gap: "md" },
  },

  Grid: {
    props: z.object({
      columns: z.number().nullable(),
      gap: z.enum(["sm", "md", "lg", "xl"]).nullable(),
      className: z.string().nullable().describe("Additional CSS classes"),
    }),
    slots: ["default"],
    description: "Grid layout (1-6 columns)",
    example: { columns: 3, gap: "md" },
  },

  Separator: {
    props: z.object({
      orientation: z.enum(["horizontal", "vertical"]).nullable(),
    }),
    description: "Visual separator line",
  },

  Tabs: {
    props: z.object({
      tabs: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
      defaultValue: z.string().nullable(),
      value: z.string().nullable(),
    }),
    slots: ["default"],
    events: ["change"],
    description:
      "Tab navigation. Use { $bindState } on value for active tab binding.",
  },

  Accordion: {
    props: z.object({
      items: z.array(
        z.object({
          title: z.string(),
          content: z.string(),
        })
      ),
      type: z.enum(["single", "multiple"]).nullable(),
    }),
    description:
      "Collapsible sections. Items as [{title, content}]. Type 'single' (default) or 'multiple'.",
  },

  Collapsible: {
    props: z.object({
      title: z.string(),
      defaultOpen: z.boolean().nullable(),
    }),
    slots: ["default"],
    description: "Collapsible section with trigger. Children render inside.",
  },

  Dialog: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
      openPath: z.string(),
    }),
    slots: ["default"],
    description:
      "Modal dialog. Set openPath to a boolean state path. Use setState to toggle.",
  },

  Drawer: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
      openPath: z.string(),
    }),
    slots: ["default"],
    description:
      "Bottom sheet drawer. Set openPath to a boolean state path. Use setState to toggle.",
  },
  Sheet: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
      openPath: z.string(),
      side: z.enum(["top", "right", "bottom", "left"]).nullable(),
    }),
    slots: ["default"],
    description: "Side sheet panel bound to openPath state.",
  },

  AlertDialog: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
      openPath: z.string(),
      confirmLabel: z.string().nullable(),
      cancelLabel: z.string().nullable(),
    }),
    description: "Confirmation dialog bound to openPath state.",
  },

  // =============
  // Data Display Components
  // ==========================================================================

  Table: {
    props: z.object({
      columns: z.array(z.string()),
      rows: z.array(z.array(z.string())),
      caption: z.string().nullable(),
    }),
    description:
      'Data table. columns: header labels. rows: 2D array of cell strings, e.g. [["Alice","admin"],["Bob","user"]].',
    example: {
      columns: ["Name", "Role"],
      rows: [
        ["Alice", "Admin"],
        ["Bob", "User"],
      ],
    },
  },

  Heading: {
    props: z.object({
      text: z.string(),
      level: z.enum(["h1", "h2", "h3", "h4"]).nullable(),
    }),
    description: "Heading text (h1-h4)",
    example: { text: "Welcome", level: "h1" },
  },

  Text: {
    props: z.object({
      text: z.string(),
      variant: z.enum(["body", "caption", "muted", "lead", "code"]).nullable(),
    }),
    description: "Paragraph text",
    example: { text: "Hello, world!" },
  },

  Avatar: {
    props: z.object({
      src: z.string().nullable(),
      name: z.string(),
      size: z.enum(["sm", "md", "lg"]).nullable(),
    }),
    description: "User avatar with fallback initials",
    example: { name: "Jane Doe", size: "md" },
  },

  Badge: {
    props: z.object({
      text: z.string(),
      variant: z
        .enum(["default", "secondary", "destructive", "outline"])
        .nullable(),
    }),
    description: "Status badge",
    example: { text: "Active", variant: "default" },
  },

  Alert: {
    props: z.object({
      title: z.string(),
      message: z.string().nullable(),
      type: z.enum(["info", "success", "warning", "error"]).nullable(),
    }),
    description: "Alert banner",
    example: {
      title: "Note",
      message: "Your changes have been saved.",
      type: "success",
    },
  },

  Progress: {
    props: z.object({
      value: z.number(),
      max: z.number().nullable(),
      label: z.string().nullable(),
    }),
    description: "Progress bar (value 0-100)",
    example: { value: 65, max: 100, label: "Upload progress" },
  },

  Skeleton: {
    props: z.object({
      width: z.string().nullable(),
      height: z.string().nullable(),
      rounded: z.boolean().nullable(),
    }),
    description: "Loading placeholder skeleton",
  },

  Spinner: {
    props: z.object({
      size: z.enum(["sm", "md", "lg"]).nullable(),
      label: z.string().nullable(),
    }),
    description: "Loading spinner indicator",
  },

  Kbd: {
    props: z.object({ keys: z.string() }),
    description: "Keyboard shortcut display",
  },

  Empty: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
    }),
    description: "Empty state placeholder",
  },

  Item: {
    props: z.object({
      title: z.string(),
      description: z.string().nullable(),
    }),
    description: "List item row with title and description",
  },

  Chart: {
    props: z.object({
      type: z.enum(["bar", "line", "area"]).nullable(),
      labels: z.array(z.string()),
      series: z.array(
        z.object({
          name: z.string(),
          values: z.array(z.number()),
        })
      ),
    }),
    description: "Simple chart from labels and numeric series",
  },

  Tooltip: {
    props: z.object({
      content: z.string(),
      text: z.string(),
    }),
    description: "Hover tooltip. Shows content on hover over text.",
  },

  Popover: {
    props: z.object({
      trigger: z.string(),
      content: z.string(),
    }),
    description: "Popover that appears on click of trigger.",
  },

  // ==========================================================================
  // Form Input Components
  // ==========================================================================

  Input: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      type: z.enum(["text", "email", "password", "number"]).nullable(),
      placeholder: z.string().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["submit", "focus", "blur"],
    description:
      "Text input field. Use { $bindState } on value for two-way binding. Use checks for validation (e.g. required, email, minLength). validateOn controls timing (default: blur).",
    example: {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "you@example.com",
    },
  },

  Textarea: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      placeholder: z.string().nullable(),
      rows: z.number().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    description:
      "Multi-line text input. Use { $bindState } on value for binding. Use checks for validation. validateOn controls timing (default: blur).",
  },

  Select: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string()),
      placeholder: z.string().nullable(),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "Dropdown select input. Use { $bindState } on value for binding. Use checks for validation. validateOn controls timing (default: change).",
  },

  Checkbox: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      checked: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "Checkbox input. Use { $bindState } on checked for binding. Use checks for validation. validateOn controls timing (default: change).",
  },

  RadioGroup: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string()),
      value: z.string().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "Radio button group. Use { $bindState } on value for binding. Use checks for validation. validateOn controls timing (default: change).",
  },

  Switch: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      checked: z.boolean().nullable(),
      checks: validationCheckSchema,
      validateOn: validateOnSchema,
    }),
    events: ["change"],
    description:
      "Toggle switch. Use { $bindState } on checked for binding. Use checks for validation. validateOn controls timing (default: change).",
  },

  Slider: {
    props: z.object({
      label: z.string().nullable(),
      min: z.number().nullable(),
      max: z.number().nullable(),
      step: z.number().nullable(),
      value: z.number().nullable(),
    }),
    events: ["change"],
    description: "Range slider input. Use { $bindState } on value for binding.",
  },

  NativeSelect: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string()),
      value: z.string().nullable(),
    }),
    events: ["change"],
    description: "Native HTML select input",
  },

  Combobox: {
    props: z.object({
      label: z.string(),
      name: z.string(),
      options: z.array(z.string()),
      placeholder: z.string().nullable(),
      value: z.string().nullable(),
    }),
    events: ["change"],
    description: "Searchable combobox select",
  },

  Calendar: {
    props: z.object({
      label: z.string().nullable(),
      value: z.string().nullable(),
    }),
    events: ["change"],
    description: "Date picker calendar. Value as ISO date string.",
  },

  // ==========================================================================
  // Action Components
  // ==========================================================================

  Button: {
    props: z.object({
      label: z.string(),
      variant: z.enum(["primary", "secondary", "danger"]).nullable(),
      disabled: z.boolean().nullable(),
    }),
    events: ["press"],
    description: "Clickable button. Bind on.press for handler.",
    example: { label: "Submit", variant: "primary" },
  },

  DropdownMenu: {
    props: z.object({
      label: z.string(),
      items: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
      value: z.string().nullable(),
    }),
    events: ["select"],
    description:
      "Dropdown menu with trigger button and selectable items. Use { $bindState } on value for selected item binding.",
  },

  Toggle: {
    props: z.object({
      label: z.string(),
      pressed: z.boolean().nullable(),
      variant: z.enum(["default", "outline"]).nullable(),
    }),
    events: ["change"],
    description:
      "Toggle button. Use { $bindState } on pressed for state binding.",
  },

  ToggleGroup: {
    props: z.object({
      items: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
      type: z.enum(["single", "multiple"]).nullable(),
      value: z.string().nullable(),
    }),
    events: ["change"],
    description:
      "Group of toggle buttons. Type 'single' (default) or 'multiple'. Use { $bindState } on value.",
  },

  ButtonGroup: {
    props: z.object({
      buttons: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
        })
      ),
      selected: z.string().nullable(),
    }),
    events: ["change"],
    description:
      "Segmented button group. Use { $bindState } on selected for selected value.",
  },

  Pagination: {
    props: z.object({
      totalPages: z.number(),
      page: z.number().nullable(),
    }),
    events: ["change"],
    description:
      "Page navigation. Use { $bindState } on page for current page number.",
  },

  Message: {
    props: z.object({
      align: z.enum(["start", "end"]).nullable(),
      body: z.string(),
      author: z.string().nullable(),
    }),
    slots: ["default"],
    description: "Chat message row",
  },

  Bubble: {
    props: z.object({
      text: z.string(),
      variant: z
        .enum([
          "default",
          "secondary",
          "muted",
          "outline",
          "ghost",
          "destructive",
        ])
        .nullable(),
      align: z.enum(["start", "end"]).nullable(),
    }),
    description: "Message bubble content",
  },

  Attachment: {
    props: z.object({
      name: z.string(),
      url: z.string().nullable(),
      sizeLabel: z.string().nullable(),
    }),
    description: "File attachment chip",
  },

  Marker: {
    props: z.object({
      label: z.string(),
    }),
    description: "Inline timeline or list marker",
  },

  Questionnaire: {
    props: z.object({
      question: z.string(),
      options: z.array(z.string()),
      value: z.string().nullable(),
    }),
    events: ["change"],
    description: "Single-choice questionnaire prompt",
  },

  StatusCard: {
    description: "Application status bound to the status tool result",
    props: z.object({
      database: z.boolean(),
      name: z.string(),
      ok: z.boolean(),
    }),
  },

  UserInfo: {
    description: "Signed-in account card",
    props: z.object({
      email: z.string().nullable(),
      image: z.string().nullable(),
      name: z.string().nullable(),
    }),
  },
};

// =============================================================================
// Types
// =============================================================================

/**
 * Type for a component definition
 */
export type ComponentDefinition = {
  props: z.ZodType;
  slots?: string[];
  events?: string[];
  description: string;
  example?: Record<string, unknown>;
};

/**
 * Infer the props type for a shadcn component by name.
 * Derives the TypeScript type directly from the Zod schema,
 * so component implementations stay in sync with catalog definitions.
 *
 * @example
 * ```ts
 * type CardProps = CommandComponentProps<"Card">;
 * // { title: string | null; description: string | null; ... }
 * ```
 */
export type CommandComponentProps<
  K extends keyof typeof commandComponentDefinitions,
> = z.output<(typeof commandComponentDefinitions)[K]["props"]>;
