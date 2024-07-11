import {
	EngineKeywords,
	OperationTypes,
	type PassthroughOperation,
	type StructOperation,
} from "@c11/engine.types";
import { randomId } from "@c11/engine.utils";
import { SyntaxKind, ts, type VariableDeclaration } from "ts-morph";
import { passthroughOperationCompiler } from "./compilers/passthroughOperationCompiler.js";
import { rawObjectCompiler } from "./compilers/rawObjectCompiler.js";
import { structOperationCompiler } from "./compilers/structOperationCompiler.js";
import { Messages } from "./messages.js";
import { paramParser } from "./parsers/paramParser.js";
import type { InstrumentationOutput } from "./types/index.js";
import { extractMeta } from "./utils/extractMeta.js";
import { transform } from "./utils/transformers.js";

export const instrumentProducer = () => (node: VariableDeclaration) => {
	const fn = node.getInitializerOrThrow().asKind(
		SyntaxKind.ArrowFunction,
		// `Expect Assignment to be Arrow Function got: '${node.getText()}'`,
	);

	if (!fn) {
		node.removeType();
		return;
	}

	let parsedParam: StructOperation | PassthroughOperation;
	let props: ts.Expression;
	const param = fn.getParameters()[0];
	const paramNode = param?.getNameNode();

	if (!paramNode || paramNode.isKind(SyntaxKind.Identifier)) {
		parsedParam = {
			type: OperationTypes.PASSTHROUGH,
		} as PassthroughOperation;
		props = passthroughOperationCompiler();
	} else if (paramNode.isKind(SyntaxKind.ObjectBindingPattern)) {
		parsedParam = paramParser(param);

		//  fn.params = paramsCompiler(babel, parsedParam);
		props = structOperationCompiler(parsedParam);
	} else {
		throw new Error(Messages.INVALID_FUNCTION_PARAM);
	}

	const metaProps = extractMeta(node);

	const sourceId = `${metaProps.absoluteFilePath}:${metaProps.name}`;
	const buildId = randomId();
	const output: InstrumentationOutput = {
		type: EngineKeywords.PRODUCER,
		meta: metaProps,
		sourceId,
		buildId,
		params: parsedParam,
	};

	const t = ts.factory;
	if (
		!(process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test")
	) {
		const meta = rawObjectCompiler(metaProps);
		transform(node, (fn: ts.ArrowFunction) => {
			const result = t.createObjectLiteralExpression([
				t.createPropertyAssignment(t.createIdentifier("fn"), fn),
				t.createPropertyAssignment(t.createIdentifier("props"), props),
				t.createPropertyAssignment(
					t.createIdentifier("type"),
					t.createStringLiteral("view"),
				),
				t.createPropertyAssignment(t.createIdentifier("meta"), meta),
				t.createPropertyAssignment(
					t.createIdentifier("buildId"),
					t.createStringLiteral(buildId),
				),
				t.createPropertyAssignment(
					t.createIdentifier("buildAt"),
					t.createNumericLiteral(Date.now()),
				),
				t.createPropertyAssignment(
					t.createIdentifier("sourceId"),
					t.createStringLiteral(sourceId),
				),
			]);

			return result;
		});
	} else {
		transform(node, (fn: ts.ArrowFunction) => {
			const p = t.createObjectLiteralExpression(
				[
					t.createPropertyAssignment("fn", fn),
					t.createPropertyAssignment("props", props),
					t.createPropertyAssignment("type", t.createStringLiteral("producer")),
					t.createPropertyAssignment(
						"buildId",
						t.createStringLiteral(randomId()),
					),
				],
				true,
			);
			return p;
		});
		return output;
	}
};
