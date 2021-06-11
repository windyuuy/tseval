/**
 * 测试块域引用
 */
namespace tseval {
	let assert = easytest.assert

	autotest.addFunc("test simple lambda def 1", () => {
		let tseval = new TSEval()
		let statement = `let lbd=()=>34*23;`
		let result = tseval.execute<{ aaa: number, }>(statement)
	})

	autotest.addFunc("test simple lambda def 2", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let x=234;let aaa=(a,b)=>x=54;`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test simple lambda def 3.1", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa=(a,b)=>54*232`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test simple lambda def 3.1", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let fwe=3;let aaa=(a,b)=>fwe*fwe;export let fff=kkk`
		let result = tseval.execute<{ fff: number }>(statement, {
			kkk: valueA,
		})
		assert(result.fff == 23)
	})

	autotest.addFunc("test simple lambda def 3.2", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa=(a,b)=>54;let ggg=234;`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test complex lambda def 1", () => {
		let tseval = new TSEval()
		let statement = `let lbd=()=>{let y=5;};`
		let result = tseval.execute<{ aaa: number, }>(statement)
	})

	autotest.addFunc("test complex lambda def 2", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa=(a,b)=>{let x=54;}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test simple func def 1", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa=function(a,b){let x=54;}export let xx=kkk;`
		let result = tseval.execute<{ xx: number }>(statement, {
			kkk: valueA,
		})
		assert(result.xx == 23)
	})

	autotest.addFunc("test simple func def 2", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let aaa=function(a,b){let x=54;}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test named func def 1", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `function fefe(a,b){let x=54;}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test named func def 2", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let ddsf=function fefe(a,b){let x=54;}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test named func def 3", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `let ddsf=function fefe(){}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

	autotest.addFunc("test named func def 4", () => {
		let valueA = 23

		let tseval = new TSEval()
		let statement = `function fefe(){234}`
		let result = tseval.execute<{ default: number }>(statement, {
			kkk: valueA,
		})
	})

}
