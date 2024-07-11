import type { Operation } from "@c11/engine.types";

export type ValuesType = Record<string, (node: any) => Operation | undefined>;
