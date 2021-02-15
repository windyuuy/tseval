
/**
 * 测试算术
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("compile docend", () => {
		let tseval = new TSEval()

		let statement = "123+32%%&\\n"
		easytest.expect_exception(() => {
			let result = tseval.evalline<{ default: number }>(statement)
		})
	})

	autotest.addFunc("summary 1", () => {
		let tseval = new TSEval()
		let statement = "123+3245-34*34*99/5455"
		let result = tseval.execute<{ default: number }>(`
	export let default= ${statement}
	`)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("summary 2", () => {
		let tseval = new TSEval()
		let statement = "123*23/2*4+3245-34*34*99/5455;"
		let result = tseval.execute<{ default: number }>(`export let default= ${statement}`)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("summary 3", () => {
		let tseval = new TSEval()
		let statement = "123*23*(234+43*(234/55)*645)/2*4+3245-34*(43+34-34*(43/234))*34*99/5455;"
		let result = tseval.execute<{ default: number }>(`export let default= ${statement}`)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("summary reverse", () => {
		let tseval = new TSEval()
		let statement = "2**3**4"
		let result = tseval.execute<{ default: number }>(`export let default= ${statement}`)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("evalline", () => {
		let tseval = new TSEval()

		let statement = "123+3245-34*34*99/5455/55*32+45-34-3-6-5+34235345-234"
		let result = tseval.evalline<{ default: number }>(statement)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("evalline", () => {
		let tseval = new TSEval()

		let statement = "234+234*34**44+32*3%2"
		let result = tseval.evalline<{ default: number }>(statement)
		assert(result.default == eval(statement), "unmatch result")
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
		let valueA = 234
		let valueB = 555
		let statement = `let aaa=${valueA};let bbb=${valueB}*aaa;export let default=bbb;`
		let tseval = new TSEval()
		let result = tseval.execute<{ default: number }>(statement)
		assert(result.default == valueA * valueB, "unmatch result")
	})

	autotest.addFunc("test docend for sentence end", () => {
		let valueA = 234
		let valueB = 555
		let statement = `let aaa=${valueA};let bbb=${valueB}*aaa;export let default=bbb`
		let tseval = new TSEval()
		let result = tseval.execute<{ default: number }>(statement)
		assert(result.default == valueA * valueB, "unmatch result")
	})

	autotest.addFunc("test bracket in calcstatement", () => {
		let statement = "2+3*(4+5/(6-7*(9-1)))"
		let content = `export let default=${statement}`
		let tseval = new TSEval()
		let result = tseval.execute<{ default: number }>(content)
		assert(result.default == eval(statement), "unmatch result")
	})

	autotest.addFunc("test duplicate declare symbol 1", () => {
		easytest.expect_exception(() => {
			let content = `let aaa=35;let aaa=665;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
		}, "", runtime.DuplicatedSymbolDeclaration)
	})

	autotest.addFunc("test duplicate declare symbol 2", () => {
		easytest.expect_exception(() => {
			let content = `let aaa=35;let bbb=665;let aaa=234;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
		}, "", runtime.DuplicatedSymbolDeclaration)
	})

	autotest.addFunc("test duplicate declare symbol 3", () => {
		easytest.expect_exception(() => {
			let content = `let aaa=35;let bbb=665;aaa=3225;let aaa=234;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
		}, "", runtime.DuplicatedSymbolDeclaration)
	})

	autotest.addFunc("test duplicate declare symbol 4", () => {
		easytest.expect_exception(() => {
			let content = `let aaa=35;let bbb=665;aaa=aaa+bbb;let aaa=234;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
		}, "", runtime.DuplicatedSymbolDeclaration)
	})

	autotest.addFunc("test a == b", () => {
		{
			let content = `let aaa=35;let bbb=35;export let default=aaa==bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == true, "unmatch result")
		}
		{
			let content = `let aaa=35;let bbb=665;export let default=aaa==bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == false, "unmatch result")
		}
		{
			let content = `let aaa=35;let bbb=35;export let default=aaa!=bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == false, "unmatch result")
		}
		{
			let content = `let aaa=35;let bbb=665;export let default=aaa!=bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == true, "unmatch result")
		}
	})

	autotest.addFunc("test a === b", () => {
		{
			let content = `let aaa=35;let bbb=35;export let default=aaa===bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == true, "unmatch result")
		}
		{
			let content = `let aaa=35;let bbb=665;export let default=aaa===bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == false, "unmatch result")
		}
		{
			let content = `let aaa=35;let bbb=35;export let default=aaa!==bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == false, "unmatch result")
		}
		{
			let content = `let aaa=35;let bbb=665;export let default=aaa!==bbb;`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content)
			assert(result.default == true, "unmatch result")
		}
	})

	autotest.addFunc("test <<, >>, <<<", () => {
		{
			let statement = "233<<44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233>>44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233>>>44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233<44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233<=44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233>44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233>=44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let valueA = 23
			let valueB = { 23: 11 }
			let statement = "aaa in mapp"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content, {
				aaa: valueA,
				mapp: valueB,
			})
			assert(result.default == (valueA in valueB), "unmatch result")
		}
		{
			let statement = "aaa instanceof Object"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: boolean }>(content, {
				aaa: {},
				Object: Object,
			})
			assert(result.default == ({} instanceof Object), "unmatch result")
		}
		{
			let statement = "233&44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233^44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233|44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233&&44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233||44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
		{
			let statement = "233??44"
			let content = `export let default=${statement};`
			let tseval = new TSEval()
			let result = tseval.execute<{ default: number }>(content)
			assert(result.default == eval(statement), "unmatch result")
		}
	})

}
