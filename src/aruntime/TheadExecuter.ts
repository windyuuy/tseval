
namespace runtime {
	export type ExecuteEnv = Object;

	export class ThreadExecuter {
		/**
		 * 执行线程指令
		 * @param instruction 
		 */
		executeInstuctions(instruction: RuntimeInstructions, env: ExecuteEnv) {
			let thread = new RuntimeThread()
			for (let inst of instruction.instructions) {
				inst[0](thread)
			}
			return thread
		}
	}
}