/**
 * 测试常量和变量赋值/运算
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test const", () => {
		let tseval = new TSEval()

		let statement = `export const default=""`
		let result = tseval.execute<{ default: string }>(statement)
		assert(result.default == "", "unmatch result")
	})

	autotest.addFunc("test immultable var assign", () => {
		easytest.expect_exception(() => {
			let tseval = new TSEval()
			let statement = `const aaa="";aaa="kljw";export let default=aaa;`
			let result = tseval.execute<{ default: string }>(statement)
			assert(result.default == "kljw", "unmatch result")
		}, "", runtime.AssignImmutableError)
	})

	autotest.addFunc("test multable var assign", () => {
		let tseval = new TSEval()

		let statement = `let aaa="";aaa="kljw";export let default=aaa;`
		let result = tseval.execute<{ default: string }>(statement)
		assert(result.default == "kljw", "unmatch result")
	})

	autotest.addFunc("test multi multable var assign", () => {
		let tseval = new TSEval()
		let statement = `let ccc="";let aaa="";let bbb="42";aaa="kljw";bbb="23";bbb=aaa;bbb=ccc;ccc=aaa;ccc=bbb;export let AAA=aaa;export let BBB=bbb;export let CCC=ccc;`
		let result = tseval.execute<{ AAA: string, BBB: string, CCC: string, }>(statement)
		assert(result.AAA == "kljw", "unmatch result")
		assert(result.BBB == "", "unmatch result")
		assert(result.CCC == "", "unmatch result")
	})

	autotest.addFunc("test multi multable var assumption", () => {
		let valueA = 234
		let valueB = 324
		let tseval = new TSEval()
		let statement = `let aaa=${valueA};let bbb=${valueB};aaa=aaa+aaa*aaa+bbb;export let default=aaa;`
		let result = tseval.execute<{ default: number, }>(statement)
		assert(result.default == valueA + valueA * valueA + valueB, "unmatch result")
	})

}
