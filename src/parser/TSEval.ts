
namespace tseval {
	/**
	 * 执行类
	 */
	export class TSEval {
		execute<T = any>(statement: string, env: Object = {}): T {
			return TSParser.compile(statement) as any
		}
	}

	autotest.addFunc(() => {
		let tseval = new TSEval()
		tseval.execute("export let default=123+3245")
	})
}

