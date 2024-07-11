import { OperationTypes, type StructOperation } from "@c11/engine.types";
import { SyntaxKind, ts, type ObjectLiteralExpression } from "ts-morph";
import { processValue } from "./processValue.js";

export const structParser = (obj: ObjectLiteralExpression): StructOperation => {
	const t = ts.factory;
	const result = {
		type: OperationTypes.STRUCT,
		value: {},
	} as StructOperation;

	for (const x of obj.getProperties()) {
		if (x.isKind(SyntaxKind.PropertyAssignment)) {
			const propName = x.getName();
			const propValue = processValue(x);
			if (propValue) {
				result.value[propName] = propValue;
			}
		} else {
			console.log("Not object property", x);
		}
	}
	return result;
};
