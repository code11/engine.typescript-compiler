/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
	preset: "ts-jest/presets/default-esm",
	testEnvironment: "node",
	transform: {
		"^.+\\.m?tsx?$": [
			"ts-jest",
			{
				tsconfig: "tsconfig.test.json",
				useESM: true,
			},
		],
	},
	extensionsToTreatAsEsm: [".ts"],
	moduleNameMapper: {
		"^(\\.{1,2}/.*)\\.js$": "$1",
	},
	snapshotSerializers: [],
};
