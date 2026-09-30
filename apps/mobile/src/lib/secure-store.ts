import * as SecureStore from "expo-secure-store";

import { createTokenStore } from "./token-store.js";

export const secureTokenStore = createTokenStore({
  storage: {
    get: ({ key }) => SecureStore.getItemAsync(key),
    remove: ({ key }) => SecureStore.deleteItemAsync(key),
    set: ({ key, value }) => SecureStore.setItemAsync(key, value),
  },
});
