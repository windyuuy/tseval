/**
 * 测试导出变量
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test export var", () => {
		let tseval = new TSEval()
		let statement = `let aaa=234;export aaa;`
		let result = tseval.execute<{ aaa: number, }>(statement)
		assert(result.aaa == 234)
	})

}
