import {
	ValueTypes,
	type InvokableValue,
	type InternalValue,
	type ExternalValue,
	type InvokeValue,
	type ConstValue,
	PathSymbol,
} from "@c11/engine.types";

export const invokablePathValueParser = (path: string[]): InvokableValue[] => {
	const result = path.map((x) => {
		const symbol = x[0];
		// console.log("invokablePathValueParser", symbol, x);
		if (symbol === PathSymbol.INTERNAL) {
			return {
				type: ValueTypes.INTERNAL,
				path: x.slice(1).split("."),
			} as InternalValue;
		}
		if (symbol === PathSymbol.EXTERNAL) {
			return {
				type: ValueTypes.EXTERNAL,
				path: x.slice(1).split("."),
			} as ExternalValue;
		}
		if (symbol === PathSymbol.INVOKABLE) {
			return {
				type: ValueTypes.INVOKE,
				path: x.slice(1).split("."),
			} as InvokeValue;
		}
		return {
			type: ValueTypes.CONST,
			value: x,
		} as ConstValue;
	});
	return result;
};
