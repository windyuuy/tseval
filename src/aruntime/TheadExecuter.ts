
namespace runtime {
	export type ExecuteEnv = Object;

	export class ThreadExecuter {
		/**
		 * 执行线程指令
		 * @param instruction 
		 */
		executeInstuctions(runtimeWaver: RuntimeWaver, instruction: RuntimeInstructions, env: ExecuteEnv) {
			let thread = runtimeWaver.createRuntimeThread(env)
			instruction.instructions.forEach((inst, i) => {
				inst[0](thread)
			})
			return thread
		}
	}
}