import { expect, jest } from "@jest/globals";
import { IndentationText, Project, QuoteKind, ScriptKind, ts } from "ts-morph";
import { IndentStyle } from "typescript";

const mockedRandomId = jest.unstable_mockModule("@c11/engine.utils", () => ({
	randomId: jest.fn().mockReturnValue("RandomId"),
}));

const divider = "\n      ↓ ↓ ↓ ↓ ↓ ↓\n";

expect.addSnapshotSerializer({
	serialize(val, config, indentation, depth, refs, printer) {
		// console.log(val, config);
		return val;
	},

	test(val) {
		return val && typeof val === "string";
	},
});

export const runCompiler = async (code: string, format = false) => {
	const { randomId } = await import("@c11/engine.utils");
	const { engineCompiler } = await import(
		"../src/index.js"
	);

	const project = new Project({
		compilerOptions: {
			resolveJsonModule: true,
			jsx: ts.JsxEmit.Preserve,
			lib: ["lib.dom.d.ts", "lib.es2022.d.ts"],
			// types: ["./global.d.ts"],
			allowArbitraryExtensions: true,
			target: ts.ScriptTarget.ES2020,
			module: ts.ModuleKind.ESNext,
			moduleResolution: ts.ModuleResolutionKind.Bundler,
			esModuleInterop: true,
			forceConsistentCasingInFileNames: true,
			strict: false,
			skipLibCheck: true,
			sourceMap: false,
			allowSyntheticDefaultImports: true,
			isolatedModules: true,
		},
		skipAddingFilesFromTsConfig: true,
		manipulationSettings: {
			indentationText: IndentationText.TwoSpaces,
			useTrailingCommas: true,
			insertSpaceAfterOpeningAndBeforeClosingNonemptyBraces: true,
			quoteKind: QuoteKind.Double,
		},
	});
	const file = project.createSourceFile("views.ts", code, {
		scriptKind: ScriptKind.TSX,
	});
	file.formatText({
		baseIndentSize: 2,
		trimTrailingWhitespace: true,
		indentStyle: IndentStyle.Block,
		ensureNewLineAtEndOfFile: true,
		indentSize: 2,
		indentMultiLineObjectLiteralBeginningOnBlankLine: true,
	});

	await engineCompiler({ project, viewLibrary: "engineViewLibrary" }).process(
		project,
	);

	const result = file.getEmitOutput().getOutputFiles()[0].getText();

	expect(`\n${code.trim()}\n${divider}\n${result.trim()}\n`).toMatchSnapshot();
};

export const addTestCase = (
	testCases: Record<string, string>,
	format = false,
) => {
	it.each(
		Object.keys(testCases).map((s) => {
			return [s.replace(/\s[0-9]{1}$/, ""), s];
		}),
	)("%s", async (name, key) => {
		const [code, expectedResult] = testCases[key].split(divider);
		await runCompiler(code);
	});
};
