import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";

import { commandComponentDefinitions } from "./definitions";

export const commandCatalog = defineCatalog(schema, {
  actions: {},
  components: commandComponentDefinitions,
});

export { commandComponentDefinitions } from "./definitions";
export type { CommandComponentProps } from "./definitions";
