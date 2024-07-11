import type {
	GetOperation,
	ObserveOperation,
	UpdateOperation,
} from "@c11/engine.types";

import { ts } from "ts-morph";
import { pathCompiler } from "./pathCompiler.js";

export const pathOperationCompiler = (
	op: GetOperation | UpdateOperation | ObserveOperation,
): ts.Expression => {
	const t = ts.factory;
	const type = t.createPropertyAssignment(
		"type",
		t.createStringLiteral(op.type),
	);
	//let value = t.createPropertyAssignment("path", t.createStringLiteral("___"));
	const value = t.createPropertyAssignment("path", pathCompiler(op.path));
	return t.createObjectLiteralExpression([type, value]);
};
