/**
 * 测试常量和变量赋值/运算
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test sub chunk", () => {
		let tseval = new TSEval()
		let statement = `let aaa=234;export aaa;`
		let result = tseval.execute<{ aaa: number, }>(statement)
		assert(result.aaa == 234)
	})

}
