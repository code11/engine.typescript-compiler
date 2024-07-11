//@ts-ignore
import testCases from "./__snapshots__/api.spec.ts.snap";
import { addTestCase } from "./compileRunner.js";

addTestCase(testCases, true);
