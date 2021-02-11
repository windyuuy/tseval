
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test const", () => {
		let tseval = new TSEval()

		let statement = `export const default=""`
		let result = tseval.execute<{ default: string }>(statement)
		assert(result.default == "", "unmatch result")
	})

	autotest.addFunc("test multable var assign", () => {
		let tseval = new TSEval()

		let statement = `let aaa="";aaa="kljw";export let default=aaa;`
		let result = tseval.execute<{ default: string }>(statement)
		assert(result.default == "kljw", "unmatch result")
	})

	autotest.addFunc("test immultable var assign", () => {
		easytest.expect_exception(() => {
			let tseval = new TSEval()
			let statement = `const aaa="";aaa="kljw";export let default=aaa;`
			let result = tseval.execute<{ default: string }>(statement)
			assert(result.default == "kljw", "unmatch result")
		}, "", runtime.AssignUnmutableError)
	}).itOnly()

}
