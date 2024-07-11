import { OperationTypes, type StructOperation } from "@c11/engine.types";
import { ts } from "ts-morph";
import { pathOperationCompiler } from "./pathOperationCompiler.js";
import { valueOperationCompiler } from "./valueOperationCompiler.js";
import { funcOperationCompiler } from "./funcOperationCompiler.js";
import { constructorOperationCompiler } from "./constructorOperationCompiler.js";

export const structOperationCompiler = (
	opOrig: StructOperation,
): ts.ObjectLiteralExpression => {
	const t = ts.factory;

	const type = t.createPropertyAssignment(
		"type",
		t.createStringLiteral(opOrig.type),
	);

	//TODO: add an id to each operation so that events can
	// be traced back to it's originator operation and parent
	// see PATCH_APPLIED
	const keys: ts.PropertyAssignment[] = Object.keys(opOrig.value)
		.map((x) => {
			const op = opOrig.value[x];
			let result: ts.Expression;
			switch (op.type) {
				case OperationTypes.GET:
				case OperationTypes.OBSERVE:
				case OperationTypes.UPDATE:
					result = pathOperationCompiler(op);
					break;

				case OperationTypes.FUNC:
					result = funcOperationCompiler(op);
					break;
				case OperationTypes.STRUCT:
					result = structOperationCompiler(op);
					break;
				case OperationTypes.VALUE:
					result = valueOperationCompiler(op);
					break;
				case OperationTypes.CONSTRUCTOR:
					result = constructorOperationCompiler(op);
					break;
				default:
					throw new Error(`Operation ${op.type} not supported`);
			}

			return t.createPropertyAssignment(x, result);
		})
		.filter((x) => !!x);

	const value = t.createPropertyAssignment(
		"value",
		t.createObjectLiteralExpression(keys),
	);

	return t.createObjectLiteralExpression([type, value]);
};
