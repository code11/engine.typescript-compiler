import type { Operation } from "@c11/engine.types";
import type { Node } from "ts-morph";
import { constValue } from "./constValue.js";
import { Values } from "./typeMapper.js";

export const processParamValue = (valueNode: Node): Operation | undefined => {
	// console.log("processing %s", valueNode.getKindName());
	if (valueNode && Values[valueNode.getKind()]) {
		return Values[valueNode.getKind()](valueNode);
	}
	console.log("No prcessor for %s", valueNode.getKindName());
	return constValue({ __node__: valueNode.compilerNode });
};
