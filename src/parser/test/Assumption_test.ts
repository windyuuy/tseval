
namespace tseval {
	let assert = easytest.assert

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

	autotest.addFunc("test export local var", () => {
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

}
