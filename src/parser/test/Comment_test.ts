/**
 * 测试注释
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test line comment", () => {
		let tseval = new TSEval()
		let statement = `let aaa=234;
		// aaa=34
		export aaa;
		`
		let result = tseval.execute<{ aaa: number, }>(statement)
		assert(result.aaa == 234)
	})

	autotest.addFunc("test block comment", () => {
		let tseval = new TSEval()
		let statement = `let aaa=234;
		/**
		 * aaa=55
		 */
		export aaa;
		`
		let result = tseval.execute<{ aaa: number, }>(statement)
		assert(result.aaa == 234)
	})

}
