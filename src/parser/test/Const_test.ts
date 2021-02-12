
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
	})

	autotest.addFunc("test multi immultable var assign", () => {
		easytest.expect_exception(() => {
			let tseval = new TSEval()
			let statement = `let ccc="";const aaa="";let bbb="42";aaa="kljw";bbb="23";bbb=aaa;bbb=ccc;ccc=aaa;ccc=bbb;export let AAA=aaa;export let BBB=bbb;export let CCC=ccc;`
			let result = tseval.execute<{ AAA: string, BBB: string, CCC: string, }>(statement)
			assert(result.AAA == "kljw", "unmatch result")
			assert(result.BBB == "", "unmatch result")
			assert(result.CCC == "", "unmatch result")
		}, "", runtime.AssignUnmutableError)
	})

}
