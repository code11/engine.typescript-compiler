import { EngineKeywords } from "@c11/engine.types";
import {
	type Node,
	SyntaxKind,
	type VariableDeclaration,
	ts,
	type Project,
} from "ts-morph";
import { instrumentProducer } from "./instrumentProducer.js";
import { instrumentView } from "./instrumentView.js";
type engineCompilerProps = {
	project: Project;
	viewLibrary?: string;
};

const canProcess = (v: VariableDeclaration) => {
	const id = v
		.getNameNode()
		.asKindOrThrow(
			SyntaxKind.Identifier,
			() => `Cannot prpcess "${v.getNameNode().getKindName()}`,
		);

	// const fn = v
	// 	.getInitializerOrThrow()
	// 	.asKindOrThrow(
	// 		SyntaxKind.ArrowFunction,
	// 		`Expect Assignment to be Arrow Function got: '${v.getText()}'`,
	// 	);

	return true;
};

export const engineCompiler = ({
	project,
	viewLibrary = "@c11/engine.react",
}: engineCompilerProps) => {
	const typeFiles = project.createSourceFile(
		"lib/.exclude/EngineTypes.ts",
		`let v: ${EngineKeywords.VIEW}; let p: ${EngineKeywords.PRODUCER};`,
	);
	const [ViewIdentifier, ProducerIdentifier] = typeFiles
		.getVariableDeclarations()
		.map((d) =>
			//@ts-ignore
			d
				.getTypeNode()
				.getFirstDescendantByKindOrThrow(ts.SyntaxKind.Identifier),
		);
	const viewProcessor = instrumentView({ viewLibrary });
	const producerProcessor = instrumentProducer();
	return {
		name: "engine-compiler",
		process: async (project: Project): Promise<void> => {
			const views = ViewIdentifier.findReferencesAsNodes()
				.filter(excludeTypesAndGenerated)
				.map(getVariableDeclaration);
			const producers = ProducerIdentifier.findReferencesAsNodes()
				.filter(excludeTypesAndGenerated)
				.map(getVariableDeclaration);

			for (const view of views) {
				if (canProcess(view)) viewProcessor(view);
			}
			for (const producer of producers) {
				if (canProcess(producer)) producerProcessor(producer);
			}
		},
	};
};
function getVariableDeclaration(n: Node<ts.Node>) {
	return n.getFirstAncestorByKindOrThrow(ts.SyntaxKind.VariableDeclaration);
}

function excludeTypesAndGenerated(n: Node<ts.Node>) {
	const path = n.getSourceFile().getFilePath();
	return !path.match(/(\/\.exclude\/)|(\.d\.ts$)/);
}
