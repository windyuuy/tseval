
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
				// 需要拆分为两步, 否则会被编译成 f.bind(this), 错误执行
				inst[0](thread)
			})
			return thread
		}
	}
}