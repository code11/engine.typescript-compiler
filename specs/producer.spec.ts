//@ts-ignore
import testCases from "./__snapshots__/producer.spec.ts.snap";
import { addTestCase } from "./compileRunner.js";

addTestCase(testCases);
