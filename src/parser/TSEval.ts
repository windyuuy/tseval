
namespace tseval {
	const assert = easytest.assert

	/**
	 * ts代码执行解释类
	 */
	export class TSEval {
		compile(statement: string, env: Object = {}): CompileResult {
			return TSParser.compile(statement)
		}
		execute<T extends Object>(content: string, env: Object = {}): T {
			let compileResult = TSParser.compile(content)
			if (!compileResult.result.isMatched) {
				throw new Error("compile failed")
			}
			let executer = new runtime.RuntimeExecuter()
			let thread = executer.executeInstuctions(compileResult.instructions, env)
			let exps = thread.getExports()
			return exps as T
		}

		evalline<T extends Object>(statement: string, env: Object = {}): T {
			let content = `export let default= ${statement}`
			let result = this.execute<T>(content, env)
			return result
		}
	}

	autotest.addFunc("summary", () => {
		let tseval = new TSEval()
		let statement = "123+3245-34*34*99/5455"
		let result = tseval.execute<{ default: number }>(`
export let default= ${statement}
`)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("evalline", () => {
		let tseval = new TSEval()

		let statement = "123+3245-34*34*99/5455"
		let result = tseval.evalline<{ default: number }>(statement)
		assert(result.default == eval(statement), "unmatch result")
	})
}

