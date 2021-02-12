/**
 * 测试块域引用
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test sub chunk 1", () => {
		let tseval = new TSEval()
		let statement = `{export let aaa=234};`
		let result = tseval.execute<{ aaa: number, }>(statement)
		assert(result.aaa == 234)
	})

	autotest.addFunc("test sub chunk 2", () => {
		let tseval = new TSEval()
		let statement = `let aaa=234;{let bbb=323;export let ddd=bbb;{export let eee=aaa};};{export let kkk=32;}let ccc=23;`
		let result = tseval.execute<{ ddd: number, eee: number, kkk: number, }>(statement)
		assert(result.ddd == 323)
		assert(result.eee == 234)
		assert(result.kkk == 32)
	})

	autotest.addFunc("test refer var out of owner chunk", () => {
		easytest.expect_exception(() => {
			let tseval = new TSEval()
			let statement = `{export let aaa=234};export let ccc=aaa;`
			let result = tseval.execute<{ aaa: number, }>(statement)
			assert(result.aaa == 234)
		}, "", runtime.InvalidLocalVarError)
	})

}
