import { OperationTypes, type FuncOperation } from "@c11/engine.types";
import type { Node } from "ts-morph";

export const funcValue = (node: Node): FuncOperation => {
	return {
		type: OperationTypes.FUNC,
		value: {
			params: [],
			fn: () => {},
		},
	};
};
