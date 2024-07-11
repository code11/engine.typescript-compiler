import { PathProps, PathSymbol } from "@c11/engine.types";
import {
	Node,
	PropertyAccessExpression,
	PropertyAssignment,
	SyntaxKind,
	ts,
} from "ts-morph";

type ValueNodes =
	| SyntaxKind.StringLiteral
	| SyntaxKind.NumericLiteral
	| SyntaxKind.TrueKeyword
	| SyntaxKind.FalseKeyword;

export const getMemberExpressionParams = (node: Node): any[] => {
	// console.log("getMemberExpressionParams", node.getKindName());
	if (node.isKind(SyntaxKind.ElementAccessExpression)) {
		const property = node.getArgumentExpression();
		const object = node.getExpression();

		if (
			property?.isKind(SyntaxKind.PropertyAccessExpression) ||
			property?.isKind(SyntaxKind.ElementAccessExpression)
		) {
			let result = getMemberExpressionParams(property.getExpression());
			let prop;
			if (property?.isKind(SyntaxKind.ElementAccessExpression))
				prop = property.getArgumentExpression();
			else prop = (property as PropertyAccessExpression).getNameNode();
			if (prop) {
				const params = getMemberExpressionParams(prop);
				result = result.concat(params);
			}

			let pathArg;
			if (result[0] === PathProps.EXTERNAL) {
				result.shift();
				pathArg = PathSymbol.EXTERNAL + result.join(".");
			} else if (result[0] === PathProps.INTERNAL) {
				result.shift();
				pathArg = PathSymbol.INTERNAL + result.join(".");
			} else if (result[0] === PathProps.PARAM) {
				result.shift();
				pathArg = PathSymbol.INVOKABLE + result.join(".");
			} else {
				pathArg = {
					__node__: property.compilerNode,
				};
			}

			return [...getMemberExpressionParams(object), pathArg];
		}
		const value = cloneOrReference(property);

		return [...getMemberExpressionParams(object), value];
	}
	if (node.isKind(SyntaxKind.PropertyAccessExpression)) {
		const property = node.getNameNode();
		const object = node.getExpression();
		return [...getMemberExpressionParams(object), property.getText()];
	}

	return getLiteralValue(node);
};

export const getLiteralValue = (node: Node) => {
	if (node.isKind(SyntaxKind.NumericLiteral)) {
		return [node.getLiteralValue()];
	}
	if (node.isKind(SyntaxKind.StringLiteral)) {
		return [node.getLiteralText()];
	}
	if (node.isKind(SyntaxKind.Identifier)) {
		return [node.getText()];
	}
	return [];
};

export const cloneOrReference = (node: Node | undefined): any => {
	if (!node) {
		console.log("cloneOrReference node is null");
		return;
	}
	let value;
	if (node.isKind(SyntaxKind.Identifier)) {
		value = { __node__: node.compilerNode };
	}

	if (node.isKind(SyntaxKind.NoSubstitutionTemplateLiteral)) {
		value = {
			__node__: ts.factory.createNoSubstitutionTemplateLiteral(
				node.getLiteralValue(),
			),
		};
	}

	if (node.isKind(SyntaxKind.TemplateSpan)) {
		value = {
			__node__: ts.factory.createTemplateSpan(
				cloneOrReference(node.getExpression()).__node__,
				cloneOrReference(node.getLiteral()).__node__,
			),
		};
	}

	if (node.isKind(SyntaxKind.TemplateHead)) {
		value = {
			__node__: ts.factory.createTemplateHead(node.getLiteralText()),
		};
	}
	if (node.isKind(SyntaxKind.TemplateMiddle)) {
		value = {
			__node__: ts.factory.createTemplateMiddle(node.getLiteralText()),
		};
	}
	if (node.isKind(SyntaxKind.TemplateTail)) {
		value = {
			__node__: ts.factory.createTemplateTail(node.getLiteralText()),
		};
	}

	if (node.isKind(SyntaxKind.TemplateExpression)) {
		value = {
			__node__: ts.factory.createTemplateExpression(
				cloneOrReference(node.getHead()).__node__,
				node.getTemplateSpans().map((p) => cloneOrReference(p).__node__),
			),
		};
	}
	if (node.isKind(SyntaxKind.StringLiteral)) {
		value = {
			__node__: ts.factory.createStringLiteral(node.getLiteralValue()),
		};
	}
	if (node.isKind(SyntaxKind.NumericLiteral)) {
		value = {
			__node__: ts.factory.createNumericLiteral(node.getLiteralValue()),
		};
	}
	if (node.isKind(SyntaxKind.RegularExpressionLiteral)) {
		value = {
			__node__: ts.factory.createRegularExpressionLiteral(
				node.getLiteralText(),
			),
		};
	}
	if (node.isKind(SyntaxKind.PropertyAssignment)) {
		return {
			__node__: ts.factory.createPropertyAssignment(
				node.getName(),
				cloneOrReference(node.getInitializer()).__node__,
			),
		};
	}

	if (node.isKind(SyntaxKind.ObjectLiteralExpression)) {
		value = {
			__node__: ts.factory.createObjectLiteralExpression(
				node.getProperties().map((p) => {
					// const pr = p.asKindOrThrow(SyntaxKind.PropertyAssignment);
					// console.log(
					// 	"Clone",
					// 	p.getKindName(),
					// 	p.getText(),
					// 	pr.getInitializer()?.getKindName(),
					// );
					return cloneOrReference(p).__node__;
				}),
			),
		};
	}

	if (!value) {
		console.warn(
			"cloneOrReference: no value",
			node.getText(),
			node.getKindName(),
		);
		return { __node__: node.compilerNode };
	}
	return value;
};
