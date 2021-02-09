
namespace runtime {
	/**
	 * 指令管理
	 */
	export class RuntimeInstructions {
		instructions: JITInstruction[] = []

		init() {
			this.instructions.length = 0
		}

		push(instruction: JITInstruction) {
			this.instructions.push(instruction)
		}

		clone() {
			let copy = new RuntimeInstructions()
			copy.instructions = this.instructions.concat()
			return copy
		}

		/**
		 * 获取指令文本
		 */
		toText() {

		}

	}
}