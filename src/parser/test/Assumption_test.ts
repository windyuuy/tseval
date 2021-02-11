
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("compile docend", () => {
		let tseval = new TSEval()

		let statement = "123+32%%&\\n"
		easytest.expect_exception(() => {
			let result = tseval.evalline<{ default: number }>(statement)
		})
	})

	autotest.addFunc("summary", () => {
		let tseval = new TSEval()
		let statement = "123+3245-34*34*99/5455"
		let result = tseval.execute<{ default: number }>(`
	export let default= ${statement}
	`)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("evalline", () => {
		let tseval = new TSEval()

		let statement = "123+3245-34*34*99/5455/55*32+45-34-3-6-5+34235345-234"
		let result = tseval.evalline<{ default: number }>(statement)
		assert(result.default == eval(statement), "unmatch result")
	})

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

	autotest.addFunc("test refer local var and calc statement", () => {
		let valueA = 23
		let valueB = 45

		let evalator = new TSEval()
		let statement = `
	let aa=${valueA}
	let bbb=${valueB}
	let ccc=aa+bbb
		`
		let thread = evalator["executeA"](statement, EmptyTable())
		assert(thread.sessions["1"].locals[1] == valueA)
		assert(thread.sessions["1"].locals[2] == valueB)
		assert(thread.sessions["1"].locals[3] == valueA + valueB)
	})

	autotest.addFunc("test export local var", () => {
		let tseval = new TSEval()

		let statement = "2345"
		let content =
			`let aaa=${statement}
	export let default=aaa
	`
		let result = tseval.execute<{ default: number }>(content)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("test export calculated local var", () => {
		let valueA = 23
		let valueB = 45

		let tseval = new TSEval()

		let statement = `let aaa=${valueA}
	let bbb=${valueB}
	let ccc=aaa+bbb
	export let default=ccc`
		let result = tseval.execute<{ default: number }>(statement)
		assert(result.default == valueA + valueB, "unmatch result")
	})

	autotest.addFunc("test semicolon for sentence", () => {
		let statement = `let aaa=234;let bbb=555*aaa;export let default=bbb;`
		let tseval = new TSEval()
		let result = tseval.execute<{ default: number }>(statement)
		assert(result.default == 234 * 555, "unmatch result")
	})

	autotest.addFunc("test docend for sentence end", () => {
		let statement = `let aaa=234;let bbb=555*aaa;export let default=bbb`
		let tseval = new TSEval()
		let result = tseval.execute<{ default: number }>(statement)
		assert(result.default == 234 * 555, "unmatch result")
	})

}
