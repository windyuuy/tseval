
namespace pgparser {
	/**
	 * 编译错误
	 */
	export class TSICompileError implements Error {
		message: string;
		stack?: string;
		name = "TSICompileError"

		constructor(message: string) {
			this.message = message;
			this.stack = new Error().stack
		}
	}
}
