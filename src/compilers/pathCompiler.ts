import { ValueTypes, type InvokablePath } from "@c11/engine.types";
import { ts } from "ts-morph";

export const pathCompiler = (
	path: InvokablePath,
): ts.ArrayLiteralExpression => {
	const t = ts.factory;

	// console.log("PathCompiler", path);
	const parts = path.map((x) => {
		const type = t.createPropertyAssignment(
			"type",
			t.createStringLiteral(x.type),
		);
		let value = t.createPropertyAssignment("ignored", t.createNull());
		if (x.type === ValueTypes.CONST) {
			let paramValue: ts.Expression;
			if (x.value.__node__) {
				paramValue = x.value.__node__;
				// console.log("Node", x.value.__node__);
			} else {
				paramValue = t.createStringLiteral(x.value);
			}

			value = t.createPropertyAssignment("value", paramValue);
		} else if (
			x.type === ValueTypes.INTERNAL ||
			x.type === ValueTypes.EXTERNAL
		) {
			const path = x.path.map((y: string) => t.createStringLiteral(y));
			value = t.createPropertyAssignment(
				"path",
				t.createArrayLiteralExpression(path),
			);
		} else if (x.type === ValueTypes.INVOKE) {
			const path = x.path.map((y: string) => t.createStringLiteral(y));
			value = t.createPropertyAssignment(
				"path",
				t.createArrayLiteralExpression(path),
			);
		} else if (x.type === ValueTypes.REFINEE) {
			const type = t.createPropertyAssignment(
				"type",
				t.createStringLiteral(x.value.type),
			);
			const args = t.createPropertyAssignment(
				"args",
				t.createArrayLiteralExpression(
					x.value.args.map((x) => {
						const type = t.createPropertyAssignment(
							"type",
							t.createStringLiteral(x.type),
						);
						let value;
						if (x.type === ValueTypes.CONST) {
							value = t.createPropertyAssignment("value", x.value);
						} else {
							value = t.createPropertyAssignment(
								"path",
								t.createArrayLiteralExpression(
									x.path.map((y: string) => t.createStringLiteral(y)),
								),
							);
						}
						return t.createObjectLiteralExpression([type, value]);
					}),
				),
			);
			value = t.createPropertyAssignment(
				"value",
				t.createObjectLiteralExpression([type, args]),
			);
		}
		return t.createObjectLiteralExpression([type, value]);
	});
	const result = t.createArrayLiteralExpression(parts);
	return result;
};
