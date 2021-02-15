
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

	autotest.addFunc("test optional chaining", () => {
		let evalator = new TSEval()
		let statement = `export let AAA=aaa?.bbb;export let BBB=ccc?.bbb;`
		let result = evalator.execute<{ AAA: number, BBB: number, }>(statement, {
			aaa: {
				bbb: 223,
			},
			ccc: null,
		})
		assert(result.AAA == 223)
		assert(result.BBB == undefined)
	})

	autotest.addFunc("test set optional chaining", () => {
		easytest.expect_exception(() => {
			let evalator = new TSEval()
			let statement = `aaa?.bbb=234`
			let result = evalator.execute<{ AAA: number, BBB: number, }>(statement, {
				aaa: {
					bbb: 223,
				},
			})
		}, "", runtime.InvalidLeftHandAssignmentError)
	})

	autotest.addFunc("test invalid left hand assignment", () => {
		easytest.expect_exception(() => {
			let evalator = new TSEval()
			let statement = `234=23`
			let result = evalator.execute<{}>(statement)
		}, "", pgparser.TSICompileError)
	})

}
