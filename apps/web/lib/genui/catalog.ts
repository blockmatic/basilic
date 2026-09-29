import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { z } from "zod";

const stackDirection = z.enum(["horizontal", "vertical"]).nullable();
const stackGap = z.enum(["sm", "md", "lg"]).nullable();
const headingLevel = z
  .union([z.literal(1), z.literal(2), z.literal(3)])
  .nullable();
const textTone = z.enum(["default", "muted"]).nullable();
const badgeVariant = z
  .enum(["default", "secondary", "destructive", "outline"])
  .nullable();
const alertVariant = z.enum(["default", "destructive"]).nullable();
const buttonVariant = z
  .enum(["default", "secondary", "destructive", "outline", "ghost"])
  .nullable();

export const boardCatalog = defineCatalog(schema, {
  actions: {
    reset_view: {
      description: "Clear SearchQuery and surface to the default ranked table",
      params: z.object({}),
    },
  },
  components: {
    Alert: {
      description: "Inline notice for honesty fallbacks and errors",
      props: z.object({
        variant: alertVariant,
        title: z.string(),
        description: z.string().nullable(),
      }),
    },
    AreaChart: {
      description: "Close series area bound to $state.series",
      props: z.object({}),
    },
    Badge: {
      description: "Status or label chip",
      props: z.object({ text: z.string(), variant: badgeVariant }),
    },
    BarChart: {
      description: "Close series bars bound to $state.series",
      props: z.object({}),
    },
    Button: {
      description: "Pressable control that emits press for catalog actions",
      events: ["press"],
      props: z.object({ label: z.string(), variant: buttonVariant }),
    },
    Card: {
      description: "Surface card with an optional title",
      props: z.object({ title: z.string().nullable() }),
      slots: ["default"],
    },
    CoinIdentity: {
      description: "Coin name, symbol, and optional image",
      props: z.object({
        name: z.string(),
        symbol: z.string(),
        imageUrl: z.string().nullable(),
      }),
    },
    DataTable: {
      description: "Coin rows bound to $state.coins",
      props: z.object({
        columns: z.array(z.string()),
        emptyLabel: z.string().nullable(),
      }),
      slots: ["default"],
    },
    Heading: {
      description: "Page or section heading",
      props: z.object({ text: z.string(), level: headingLevel }),
    },
    Insight: {
      description: "Honesty or helper line under the caption",
      props: z.object({ text: z.string() }),
    },
    LineChart: {
      description: "Close series line bound to $state.series",
      props: z.object({ scale: z.enum(["price", "normalized"]).nullable() }),
    },
    MetricTile: {
      description: "Global metric tile bound to $state.global",
      props: z.object({
        field: z.enum(["btcDominance", "marketCapUsd", "volumeUsd"]),
        label: z.string(),
      }),
    },
    NftGrid: {
      description: "Linked wallet NFTs bound to $state.wallet",
      props: z.object({ hidden: z.boolean() }),
    },
    PercentageChange: {
      description: "Signed 24h percent change",
      props: z.object({ value: z.number() }),
    },
    Price: {
      description: "USD price in tabular numerals",
      props: z.object({ value: z.number() }),
    },
    QuerySummary: {
      description: "Read-only caption of the current SearchQuery",
      props: z.object({ caption: z.string() }),
    },
    Section: {
      description: "Titled region wrapping table or account content",
      props: z.object({ title: z.string().nullable() }),
      slots: ["default"],
    },
    Separator: {
      description: "Horizontal rule between board sections",
      props: z.object({}),
    },
    Stack: {
      description: "Flex row or column that groups board sections",
      props: z.object({ direction: stackDirection, gap: stackGap }),
      slots: ["default"],
    },
    Text: {
      description: "Body copy, optionally muted",
      props: z.object({ text: z.string(), tone: textTone }),
    },
    TokenTable: {
      description: "Linked wallet tokens bound to $state.wallet",
      props: z.object({
        network: z.enum(["all", "eth-mainnet", "base-mainnet"]),
      }),
    },
    TrendingTable: {
      description: "Trending coins bound to $state.trending",
      props: z.object({}),
    },
    UserInfo: {
      description: "Account card with avatar and profile fields",
      props: z.object({
        name: z.string().nullable(),
        email: z.string().nullable(),
        image: z.string().nullable(),
        username: z.string().nullable(),
        joinedAt: z.string().nullable(),
      }),
    },
  },
});
