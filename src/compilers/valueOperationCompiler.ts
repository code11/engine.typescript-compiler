import { type ValueOperation, ValueTypes } from "@c11/engine.types";
import { ts } from "ts-morph";

export const valueOperationCompiler = (op: ValueOperation): ts.Expression => {
	const t = ts.factory;
	let value = t.createPropertyAssignment("path", t.createStringLiteral("___"));
	const type = t.createPropertyAssignment(
		"type",
		t.createStringLiteral(op.type),
	);
	if (op.value.type === ValueTypes.CONST) {
		const val = op.value.value;

		let valType;
		if (val?.__node__) {
			valType = val.__node__;
		} else if (typeof val === "string") {
			valType = t.createStringLiteral(val);
		} else if (typeof val === "number") {
			valType = t.createNumericLiteral(val);
		} else if (typeof val === "boolean") {
			valType = val ? t.createTrue() : t.createFalse();
		} else {
			throw new Error(`Value type not supported yet: ${typeof val}`);
		}
		value = t.createPropertyAssignment(
			"value",
			t.createObjectLiteralExpression([
				t.createPropertyAssignment(
					"type",
					t.createStringLiteral(ValueTypes.CONST),
				),
				t.createPropertyAssignment("value", valType),
			]),
		);
	} else if (
		op.value.type === ValueTypes.EXTERNAL ||
		op.value.type === ValueTypes.INTERNAL
	) {
		const path = t.createArrayLiteralExpression(
			op.value.path.map((x) => {
				return t.createStringLiteral(x);
			}),
		);
		value = t.createPropertyAssignment(
			"value",
			t.createObjectLiteralExpression([
				t.createPropertyAssignment(
					"type",
					t.createStringLiteral(op.value.type),
				),
				t.createPropertyAssignment("path", path),
			]),
		);
	}
	const result = t.createObjectLiteralExpression([type, value]);
	return result;
};
