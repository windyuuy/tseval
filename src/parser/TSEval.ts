
namespace tseval {
	const assert = easytest.assert

	/**
	 * ts代码执行解释类
	 */
	export class TSEval {
		/**
		 * 编译结果缓存
		 * - 基于: 相同的编译输入产生相同的编译输出
		 */
		protected compileCache: { [key: string]: CompileResult } = fsync.EmptyTable()
		/**
		 * 从编译缓存中获取编译结果
		 * @param statement 
		 * @param env 
		 */
		protected getCompileResultFromCache(statement: string, env: Object): CompileResult {
			return this.compileCache[statement]
		}

		/**
		 * 编译脚本
		 * - 优先从编译缓存中获取编译结果, 如果结果不存在, 那么执行编译
		 * @param statement 
		 * @param env 
		 */
		compile(statement: string, env: Object = {}): CompileResult {
			let compileResult = this.getCompileResultFromCache(statement, env)
			if (compileResult == null) {
				compileResult = TSParser.compile(statement, env)
			}
			return compileResult
		}

		/**
		 * 执行脚本, 并返回线程控制对象
		 * @param content 
		 * @param env 
		 */
		protected executeA(content: string, env: Object): runtime.RuntimeThread {
			// 编译
			let compileResult = this.compile(content, env)
			// 检查编译结果
			if (!compileResult.parseResult.isMatched) {
				let result = compileResult.parseResult
				let surroundTexts = result.getSurroundTexts()
				let msg = `compile failed, at: [${result.loc[0]},${result.loc[1]}], text: ${surroundTexts[0]}▲▲${surroundTexts[1]}▲▲${surroundTexts[2]}, reason: "${result.reason}".`
				throw new pgparser.TSICompileError(msg)
			}
			// 检查运行时构建错误
			compileResult.checkRuntimeWaverError()
			// 执行指令
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

