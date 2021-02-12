/**
 * 测试环境变量引用
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test refer env variable 1", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `export const default=kkk`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
		assert(result.default == valueA, "unmatch result")
	})

	autotest.addFunc("test refer env variable 2", () => {
		let valueA = 2335
		let tseval = new TSEval()
		let statement = `let aaa=kkk;let bbb=kkk;let ccc=aaa*bbb*kkk;export let default=ccc;`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
		assert(result.default == valueA * valueA * valueA, "unmatch result")
	})

	autotest.addFunc("test refer var member", () => {
		let evalator = new TSEval()
		let statement = `export let default=kkk.aaa.bbb`
		let result = evalator.execute<{ default: number }>(statement, {
			kkk: {
				aaa: {
					bbb: 34,
				},
			},
		})
		assert(result.default == 34)
	}).only()
}
