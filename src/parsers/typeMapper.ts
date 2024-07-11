import {
	OperationTypes,
	PathType,
	ValueTypes,
	type GetOperation,
	type InvokableValue,
	type ObserveOperation,
	type Operation,
	type UpdateOperation,
	type ValueOperation,
} from "@c11/engine.types";
import {
	type CallExpression,
	SyntaxKind,
	ts,
	type ArrowFunction,
	type ElementAccessExpression,
	type FunctionExpression,
	type Identifier,
	type ObjectLiteralExpression,
	type PropertyAccessExpression,
	type RegularExpressionLiteral,
	type StringLiteral,
} from "ts-morph";
import {
	cloneOrReference,
	getMemberExpressionParams,
} from "../utils/getMemberExpressionParams.js";
import { constValue } from "./constValue.js";
import { invokablePathValueParser } from "./invokablePathValueParser.js";
import { structParser } from "./structParser.js";
import type { ValuesType } from "./types.js";
import { funcValue } from "./funcValue.js";

const t = ts.factory;
export const Values: ValuesType = {
	// foo = get.foo.bar

	[SyntaxKind.StringLiteral]: (node: StringLiteral) => {
		return constValue(node.getLiteralText());
	},
	[SyntaxKind.RegularExpressionLiteral]: (node: RegularExpressionLiteral) => {
		return constValue({
			__node__: t.createRegularExpressionLiteral(node.getLiteralText()),
		});
	},
	[SyntaxKind.NumericLiteral]: (node: StringLiteral) => {
		return constValue(node.getLiteralValue());
	},
	[SyntaxKind.FunctionExpression]: (node: FunctionExpression) => {
		return constValue({ __node__: node.compilerNode });
	},
	[SyntaxKind.ArrowFunction]: (node: ArrowFunction) => {
		return constValue({ __node__: node.compilerNode });
	},
	// [SyntaxKind.NullKeyword]: (node: NullLiteral) => {
	// 	return constValue({ __node__: t.createNull() });
	// },
	[SyntaxKind.ElementAccessExpression]: memberExprssion,
	[SyntaxKind.PropertyAccessExpression]: memberExprssion,
	[SyntaxKind.CallExpression]: (node: CallExpression) => {
		const result = memberExprssion(node.getExpression() as any);
		if (
			result &&
			(result.type === OperationTypes.GET ||
				result.type === OperationTypes.OBSERVE ||
				result.type === OperationTypes.UPDATE) &&
			result.path.length > 0
		) {
			const lastIdx = result.path.length - 1;
			const last = result.path[lastIdx];
			if (last.type !== ValueTypes.CONST || last.value?.__node__) {
				throw new Error(`refining ${result.type} does not support expressions`);
			}
			//TODO: throw if it's not an approved keyword
			result.path[lastIdx] = {
				type: ValueTypes.REFINEE,
				value: {
					type: last.value,
					args: node.getArguments().map((x) => {
						// return processParamValue(x);
						// TODO: process arguments properly -> could be arg, prop
						// return paramParser(x)
						// console.log(x.getKindName());
						return {
							type: ValueTypes.CONST,
							value: cloneOrReference(x).__node__,
						};
					}),
				},
			};
		}
		return result;
	},
	// foo = get.foo || get.bar
	//LogicalExpression
	// [SyntaxKind.LogicalExpression]: (node) => {
	// 	return logicalExpression(node);
	// },
	// foo = get.foo ? true : false
	// ConditionalExpression
	[SyntaxKind.ConditionalExpression]: (node) => {
		return funcValue(node);
	},
	[SyntaxKind.BinaryExpression]: (node) => {
		return funcValue(node);
	},
	// ObjectExpression
	[SyntaxKind.ObjectLiteralExpression]: (node: ObjectLiteralExpression) => {
		const value = structParser(node);
		return value;
	},
	[SyntaxKind.Identifier]: (identifier: Identifier) => {
		if (
			identifier.compilerNode.escapedText === PathType.GET ||
			identifier.compilerNode.escapedText === PathType.OBSERVE ||
			identifier.compilerNode.escapedText === PathType.UPDATE
		) {
			return {
				type: OperationTypes.CONSTRUCTOR,
				value: identifier.compilerNode.escapedText.toString(),
			} as Operation;
		}
		return constValue({ __node__: identifier.compilerNode });
	},
};
function memberExprssion(
	node: PropertyAccessExpression | ElementAccessExpression,
) {
	const params = getMemberExpressionParams(node);
	const op = params[0] as PathType;
	const rawPath = params.slice(1);
	const path: InvokableValue[] = invokablePathValueParser(rawPath);

	// console.log("PropertyAccessExpression %s", op, rawPath, path);
	// TODO: Is path valid? e.g. get operations with invoke
	if (op === PathType.GET) {
		return {
			type: OperationTypes.GET,
			path,
		} as GetOperation;
	}
	if (op === PathType.OBSERVE) {
		return {
			type: OperationTypes.OBSERVE,
			path,
		} as ObserveOperation;
	}
	if (op === PathType.UPDATE) {
		return {
			type: OperationTypes.UPDATE,
			path,
		} as UpdateOperation;
	}
	if (op === PathType.PROP) {
		return {
			type: OperationTypes.VALUE,
			value: {
				type: ValueTypes.EXTERNAL,
				path: rawPath,
			},
		} as ValueOperation;
	}
	if (op === PathType.ARG) {
		return {
			type: OperationTypes.VALUE,
			value: {
				type: ValueTypes.INTERNAL,
				path: rawPath,
			},
		} as ValueOperation;
	}
	return constValue({ __node__: node.compilerNode });
}
