"use client";

import { defineRegistry } from "@json-render/react";

import { commandCatalog } from "@/lib/genui/catalog";

import { cardComponents } from "./cards";
import { conversationComponents } from "./conversation";
import { coreComponents } from "./core";
import { extraComponents } from "./extra";
import { overlayComponents } from "./overlays";

export const { registry: commandRegistry } = defineRegistry(commandCatalog, {
  actions: {},
  components: {
    ...coreComponents,
    ...extraComponents,
    ...overlayComponents,
    ...conversationComponents,
    ...cardComponents,
  },
});
