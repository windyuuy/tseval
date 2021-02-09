
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
		 * 文法解析结果
		 */
		result: pgparser.MatchedResult

		/**
		 * 获取运行时指令
		 */
		getInstructions() {
			return this.instructions.instructions
		}
	}
}
