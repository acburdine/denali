import CommandAcceptanceTest from './command-acceptance';
/**
 * A specialized version of a CommandAcceptanceTest which tests the generate / destroy invocations
 * of a specific blueprint.
 *
 * @package test
 */
export default class BlueprintAcceptanceTest extends CommandAcceptanceTest {
    /**
     * The name of the blueprint to test
     */
    blueprintName: string;
    constructor(blueprintName: string);
    /**
     * Run the generate command with the supplied blueprint name and return a Promise that resolves
     * when complete.
     */
    generate(args: string): Promise<{
        stdout: string;
        stderr: string;
        dir: string;
    }>;
    /**
     * Run the destroy command with the supplied blueprint name and return a Promise that resolves
     * when complete.
     */
    destroy(args: string): Promise<{
        stdout: string;
        stderr: string;
        dir: string;
    }>;
}
