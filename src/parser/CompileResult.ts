
namespace tseval {
	/**
	 * 存储编译结果
	 */
	export class CompileResult {
		/**
		 * 生成指令
		 */
		instructions: runtime.RuntimeInstructions
		/**
		 * 运行构建时状态
		 */
		runtimeWaver: runtime.RuntimeWaver
		/**
		 * 文法解析结果
		 */
		result: pgparser.MatchedResult

		/**
		 * 获取运行时指令
		 */
		getInstructions() {
			return this.instructions.instructions
		}

		/**
		 * 检查运行时构建错误
		 */
		checkRuntimeWaverError() {
			let err = this.runtimeWaver.getTopError()
			if (err) {
				throw err.throwable
			}
		}
	}
}
