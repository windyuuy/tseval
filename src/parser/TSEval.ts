
namespace tseval {
	const assert = easytest.assert

	/**
	 * ts代码执行解释类
	 */
	export class TSEval {
		/**
		 * 编译脚本
		 * @param statement 
		 * @param env 
		 */
		compile(statement: string, env: Object = {}): CompileResult {
			return TSParser.compile(statement, env)
		}

		/**
		 * 执行脚本, 并返回线程控制对象
		 * @param content 
		 * @param env 
		 */
		protected executeA(content: string, env: Object): runtime.RuntimeThread {
			let compileResult = this.compile(content, env)
			if (!compileResult.result.isMatched) {
				throw new pgparser.TSICompileError("compile failed")
			}
			compileResult.checkRuntimeWaverError()
			let threadExecuter = new runtime.ThreadExecuter()
			let thread = threadExecuter.executeInstuctions(compileResult.runtimeWaver, compileResult.instructions, env)
			return thread
		}

		/**
		 * 编译脚本并执行
		 * @param content 
		 * @param env 
		 */
		execute<T extends Object>(content: string, env: Object = {}): T {
			let thread = this.executeA(content, env)
			let exps = thread.getExports()
			return exps as T
		}

		/**
		 * 执行单行脚本
		 * @param statement 
		 * @param env 
		 */
		evalline<T extends Object>(statement: string, env: Object = {}): T {
			let content = `export let default= ${statement}`
			let result = this.execute<T>(content, env)
			return result
		}
	}

}

