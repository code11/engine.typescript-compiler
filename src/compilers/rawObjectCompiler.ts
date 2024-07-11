import type { ProducerMeta } from "@c11/engine.types";
import { ts } from "ts-morph";

export const rawObjectCompiler = (
	obj: ProducerMeta,
): ts.ObjectLiteralExpression => {
	const t = ts.factory;
	const props = Object.keys(obj).reduce((acc, x) => {
		//@ts-ignore
		const val = obj[x];
		let result: ts.Expression;
		if (typeof val === "string") {
			result = t.createStringLiteral(val);
		} else if (typeof val === "number") {
			result = t.createNumericLiteral(val);
		} else if (Array.isArray(val)) {
			const list = val.map((x) => t.createStringLiteral(x));
			result = t.createArrayLiteralExpression(list);
		} else if (typeof val === "object") {
			result = rawObjectCompiler(val);
		} else if (val === undefined) {
			result = t.createIdentifier("undefined");
		} else {
			throw new Error(`Meta type for ${val} not supported`);
		}
		if (result) {
			acc.push(t.createPropertyAssignment(t.createIdentifier(x), result));
		}
		return acc;
	}, [] as ts.PropertyAssignment[]);

	return t.createObjectLiteralExpression(props);
};
