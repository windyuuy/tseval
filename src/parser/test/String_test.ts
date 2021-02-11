
// namespace tseval {
// 	let assert = easytest.assert

// 	autotest.addFunc("test empty simple string", () => {
// 		let tseval = new TSEval()

// 		let statement = `export let default=""`
// 		let result = tseval.execute<{ default: string }>(statement)
// 		assert(result.default == "", "unmatch result")
// 	})

// 	autotest.addFunc("test short string", () => {
// 		let tseval = new TSEval()

// 		let statement = "drfgfhetrhe44%##@$%%'"
// 		let content = `export let default="${statement}"`
// 		let result = tseval.execute<{ default: string }>(content)
// 		assert(result.default == statement, "unmatch result")
// 	})

// 	autotest.addFunc("test empty long string", () => {
// 		let tseval = new TSEval()

// 		let statement = ""
// 		let content = `export let default='<${statement}>'`
// 		let result = tseval.execute<{ default: string }>(content)
// 		assert(result.default == statement, "unmatch result")
// 	})

// 	autotest.addFunc("test long string", () => {
// 		let tseval = new TSEval()

// 		let statement = "wrgrd%^&*@($*(*^^&*!@(#()#@)(^*&^&*#@\"'[[f]e"
// 		let content = `export let default='<${statement}>'`
// 		let result = tseval.execute<{ default: string }>(content)
// 		assert(result.default == statement, "unmatch result")
// 	})

// 	autotest.addFunc("test long string convert special", () => {
// 		let tseval = new TSEval()

// 		let statement = ">\\'>\\\\\\'"
// 		let content = `export let default='<${statement}>'`
// 		let result = tseval.execute<{ default: string }>(content)
// 		assert(result.default == ">'>\\'", "unmatch result")
// 	})

// }
