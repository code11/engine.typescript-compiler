import type { ConstructorOperation } from "@c11/engine.types";
import { ts } from "ts-morph";

export const constructorOperationCompiler = (
	op: ConstructorOperation,
): ts.Expression => {
	const t = ts.factory;
	const value = t.createPropertyAssignment(
		"value",
		t.createStringLiteral(op.value),
	);
	const type = t.createPropertyAssignment(
		"type",
		t.createStringLiteral(op.type),
	);
	return t.createObjectLiteralExpression([type, value]);
};
