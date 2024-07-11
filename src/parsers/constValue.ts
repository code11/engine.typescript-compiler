import {
	OperationTypes,
	ValueTypes,
	type ValueOperation,
} from "@c11/engine.types";

export const constValue = (value: any): ValueOperation => {
	return {
		type: OperationTypes.VALUE,
		value: {
			type: ValueTypes.CONST,
			value: value,
		},
	};
};
