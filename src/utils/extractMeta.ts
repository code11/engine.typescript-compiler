import type { ProducerMeta } from "@c11/engine.types";
import { SyntaxKind, type VariableDeclaration } from "ts-morph";

export const extractMeta = (node: VariableDeclaration): ProducerMeta => {
	const result: ProducerMeta = {};

	if (node.getNameNode().isKind(SyntaxKind.Identifier)) {
		result.name = node.getName();
	}
	const loc = node.getStart();
	if (loc) {
		const file = node.getSourceFile();
		result.location = {
			start: {
				line: node.getStartLineNumber(),
				column: node.getStartLinePos(),
			},
			end: {
				line: node.getEndLineNumber(),
				column: node.getEndLineNumber(),
			},
		};
		result.absoluteFilePath = `${file.getFilePath()}:${node.getPos()}`;
	}

	return result;
};
