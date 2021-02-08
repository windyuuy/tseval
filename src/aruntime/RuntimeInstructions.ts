
namespace runtime {
	/**
	 * 指令管理
	 */
	export class RuntimeInstructions {
		instructions: JITInstruction[] = []

		push(instruction: JITInstruction) {
			this.instructions.push(instruction)
		}

	}
}