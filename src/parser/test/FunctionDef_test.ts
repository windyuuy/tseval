/**
 * 测试块域引用
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test func def 1", () => {
		let tseval = new TSEval()
		let statement = `let lbd={|| let y=5;};`
		let result = tseval.execute<{ aaa: number, }>(statement)
	}).only()

	autotest.addFunc("test func def 2", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa={|a,b| let x=54;}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

}
