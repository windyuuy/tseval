
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
			return TSParser.compile(statement + "\n")
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
			let threadExecuter = new runtime.ThreadExecuter()
			let thread = threadExecuter.executeInstuctions(compileResult.instructions, env)
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

	// 	autotest.addFunc("compile docend", () => {
	// 		let tseval = new TSEval()

	// 		let statement = "123+32%%&\\n"
	// 		easytest.expect_exception(() => {
	// 			let result = tseval.evalline<{ default: number }>(statement)
	// 		})
	// 	})

	// 	autotest.addFunc("summary", () => {
	// 		let tseval = new TSEval()
	// 		let statement = "123+3245-34*34*99/5455"
	// 		let result = tseval.execute<{ default: number }>(`
	// export let default= ${statement}
	// `)
	// 		assert(result.default == eval(statement), "unmatch result")
	// 	})

	// 	autotest.addFunc("evalline", () => {
	// 		let tseval = new TSEval()

	// 		let statement = "123+3245-34*34*99/5455/55*32+45-34-3-6-5+34235345-234"
	// 		let result = tseval.evalline<{ default: number }>(statement)
	// 		assert(result.default == eval(statement), "unmatch result")
	// 	})

}

