//@ts-ignore
import testCases from "./__snapshots__/values.spec.ts.snap";
import { addTestCase } from "./compileRunner.js";

addTestCase(testCases);
