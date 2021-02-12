
/**
 * 测试局部变量声明和引用
 */
namespace tseval {

	autotest.addFunc("testlocal", () => {
		let evalator = new TSEval()
		let statement = "let aa=23"
		let thread = evalator["executeA"](statement, EmptyTable())
		assert(thread.sessions["1"].locals[1] == 23)
	})

	autotest.addFunc("test declare mult local var", () => {
		let evalator = new TSEval()
		let statement = `
	let aa=23
	let bbb = 455`
		let thread = evalator["executeA"](statement, EmptyTable())
		assert(thread.sessions["1"].locals[1] == 23)
		assert(thread.sessions["1"].locals[2] == 455)
	})

	autotest.addFunc("test refer local var", () => {
		let evalator = new TSEval()
		let statement = `
	let aa=23
	let bbb=aa
	`
		let thread = evalator["executeA"](statement, EmptyTable())
		assert(thread.sessions["1"].locals[1] == 23)
		assert(thread.sessions["1"].locals[2] == 23)
	})
}
