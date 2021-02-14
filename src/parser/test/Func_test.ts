/**
 * 测试环境变量引用
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test def function", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa={|a,b| let x=54;}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
		// assert(result.default == valueA, "unmatch result")
	})

	autotest.addFunc("test call function 1", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `export let default=aaa()`
		let result = tseval.execute<{ default: number }>(statement, {
			aaa: function () { return valueA },
		})
		assert(result.default == valueA, "unmatch result")
	})

	autotest.addFunc("test call function 2", () => {
		let valueA = 23
		let valueB = 554

		let tseval = new TSEval()
		let statement = `export let default=${valueB}+aaa()()`
		let result = tseval.execute<{ default: number }>(statement, {
			aaa: function () { return function () { return valueA } },
		})
		assert(result.default == valueB + valueA, "unmatch result")
	})

}
