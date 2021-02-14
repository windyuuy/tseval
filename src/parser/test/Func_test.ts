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

}
