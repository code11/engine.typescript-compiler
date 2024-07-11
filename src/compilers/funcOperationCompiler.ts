import type { FuncOperation } from "@c11/engine.types";
import { ts } from "ts-morph";

export const funcOperationCompiler = (op: FuncOperation): ts.Expression => {
	const t = ts.factory;
	const type = t.createPropertyAssignment(
		"type",
		t.createStringLiteral(op.type),
	);
	const paramsList = op.value.params.map((x) => {
		const type = t.createPropertyAssignment(
			"type",
			t.createStringLiteral(x.type),
		);
		const value = t.createPropertyAssignment(
			"value",
			t.createStringLiteral("value"),
		);
		return t.createObjectLiteralExpression([type, value]);
	});
	const fn = t.createPropertyAssignment("fn", t.createStringLiteral("fn"));
	const paramsArray = t.createArrayLiteralExpression(paramsList);
	const params = t.createPropertyAssignment("params", paramsArray);
	const internal = t.createObjectLiteralExpression([params, fn]);
	const value = t.createPropertyAssignment("value", internal);
	return t.createObjectLiteralExpression([type, value]);
};
