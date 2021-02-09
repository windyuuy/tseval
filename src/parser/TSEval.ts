
namespace tseval {
	const assert = easytest.assert

	/**
	 * 执行类
	 */
	export class TSEval {
		compile(statement: string, env: Object = {}): CompileResult {
			return TSParser.compile(statement)
		}
		execute<T extends Object>(statement: string, env: Object = {}): T {
			let compileResult = TSParser.compile(statement)
			let executer = new runtime.RuntimeExecuter()
			let thread = executer.executeInstuctions(compileResult.instructions, env)
			let exps = thread.getExports()
			return exps as T
		}
	}

	// autotest.addFunc(() => {
	// 	let tseval = new TSEval()
	// 	let result = tseval.compile("export let default=123+3245-34*34/5455")
	// 	let insts = result.getInstructions()
	// 	console.log(insts)
	// })
	autotest.addFunc(() => {
		let tseval = new TSEval()
		let result = tseval.execute<{ default: number }>(`
export let default=123+3245-34*34/5455
`)
		assert(result.default == 3367.788084326306, "unmatch result")
	})
}

