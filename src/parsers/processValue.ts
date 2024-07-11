import type { Operation } from "@c11/engine.types";
import { Node, type PropertyAssignment, ts } from "ts-morph";
import { constValue } from "./constValue.js";
import { Values } from "./typeMapper.js";

export const processValue = (node: PropertyAssignment): Operation | void => {
	let valueNode;

	const initializer = node.getInitializer();
	if (Node.isBindingElement(initializer)) {
		valueNode = initializer.getInitializer();
	} else {
		valueNode = initializer;
	}
	// console.log("processValue %s", node.getKindName(), valueNode?.getKindName());

	if (valueNode && Values[valueNode.getKind()]) {
		return Values[valueNode.getKind()](valueNode);
	}
	return constValue({ __node__: valueNode?.compilerNode });
};
