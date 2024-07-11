import { OperationTypes } from "@c11/engine.types";
import { ts } from "ts-morph";

export const passthroughOperationCompiler = () => {
	const t = ts.factory;
	const type = t.createPropertyAssignment(
		"type",
		t.createStringLiteral(OperationTypes.PASSTHROUGH),
	);
	return t.createObjectLiteralExpression([type]);
};
