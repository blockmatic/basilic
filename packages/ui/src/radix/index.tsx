// Re-export all Radix UI primitives for centralized access
// This allows apps to import Radix primitives from @repo/ui/radix
// instead of installing them individually
//
// Using namespace exports to avoid name collisions between packages
// that export components with the same names (e.g., Root, Content, Trigger)

export * as Accordion from '@radix-ui/react-accordion'
export * as AlertDialog from '@radix-ui/react-alert-dialog'
export * as AspectRatio from '@radix-ui/react-aspect-ratio'
export * as Avatar from '@radix-ui/react-avatar'
export * as Checkbox from '@radix-ui/react-checkbox'
export * as Collapsible from '@radix-ui/react-collapsible'
export * as ContextMenu from '@radix-ui/react-context-menu'
export * as Dialog from '@radix-ui/react-dialog'
export * as DropdownMenu from '@radix-ui/react-dropdown-menu'
export * as HoverCard from '@radix-ui/react-hover-card'
export * as Label from '@radix-ui/react-label'
export * as Menubar from '@radix-ui/react-menubar'
export * as NavigationMenu from '@radix-ui/react-navigation-menu'
export * as Popover from '@radix-ui/react-popover'
export * as Progress from '@radix-ui/react-progress'
export * as RadioGroup from '@radix-ui/react-radio-group'
export * as ScrollArea from '@radix-ui/react-scroll-area'
export * as Select from '@radix-ui/react-select'
export * as Separator from '@radix-ui/react-separator'
export * as Slider from '@radix-ui/react-slider'
export * as Slot from '@radix-ui/react-slot'
export * as Switch from '@radix-ui/react-switch'
export * as Tabs from '@radix-ui/react-tabs'
export * as Toast from '@radix-ui/react-toast'
export * as Toggle from '@radix-ui/react-toggle'
export * as ToggleGroup from '@radix-ui/react-toggle-group'
export * as Tooltip from '@radix-ui/react-tooltip'
