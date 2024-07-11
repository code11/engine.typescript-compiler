import {
	OperationTypes,
	ValueTypes,
	type StructOperation,
	type ValueOperation,
} from "@c11/engine.types";
import { SyntaxKind, type ParameterDeclaration } from "ts-morph";
import { processParamValue } from "./processParamValue.js";

export const paramParser = (param: ParameterDeclaration): StructOperation => {
	if (!param) {
		return {
			type: OperationTypes.STRUCT,
			value: {},
			meta: {},
		};
	}

	if (param.getDotDotDotToken()) {
		throw new Error(
			`Rest operator is not supported. found in: ${param
				.getSourceFile()
				.getFilePath()}`,
		);
	}

	const objectBinding = param
		.getNameNode()
		.asKindOrThrow(SyntaxKind.ObjectBindingPattern);

	const result = {
		type: OperationTypes.STRUCT,
		value: {},
	} as StructOperation;

	for (const element of objectBinding.getElements()) {
		if (element.getDotDotDotToken()) {
			throw new Error("Rest operator is not supported.");
		}
		const propName = element.getName();

		const intializer = element.getInitializer();
		if (!intializer) {
			const propValue = {
				type: OperationTypes.VALUE,
				value: {
					type: ValueTypes.EXTERNAL,
					path: [propName],
				},
			} as ValueOperation;
			result.value[propName] = propValue;
		} else {
			const propValue = processParamValue(intializer);
			// TODO: this is the source of troubls for cloneOrReference function
			element.removeInitializer();
			if (propValue) {
				result.value[propName] = propValue;
			} else {
				throw new Error(`Property ${propName} could not be processed.`);
			}
		}
	}

	return result;
};
