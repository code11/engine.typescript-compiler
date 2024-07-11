import { ts, type VariableDeclaration } from "ts-morph";
const t = ts.factory;

export const transform = (
	node: VariableDeclaration,
	transformer: (node: ts.ArrowFunction) => ts.Node,
) => {
	node.transform((traversal) => {
		const node = traversal.visitChildren(); // recommend always visiting the children first (post order)
		if (ts.isArrowFunction(node)) {
			return transformer(node);
		}
		return node;
	});
	node.removeType();
};
