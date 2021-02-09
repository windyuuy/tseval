
namespace tseval {
	/**
	 * 执行类
	 */
	export class TSEval {
		compile(statement: string, env: Object = {}): CompileResult {
			return TSParser.compile(statement)
		}
		execute<T = any>(statement: string, env: Object = {}): T {
			return TSParser.compile(statement) as any
		}
	}

	autotest.addFunc(() => {
		let tseval = new TSEval()
		let result = tseval.compile("export let default=123+3245-34*34/5455")
		let insts = result.getInstructions()
		console.log(insts)
	})
}

