
/// <reference path="./TTSTranslater.ts" />

namespace tseval {
	const { exactly, sequence, union, repeat, wrap, not, } = pgparser.MatcherFactory
	namespace parser {
		function combine(a: Function, b: Function, c?: Function) {
			return function (...args: any[]) {
				a && a(...args);
				b && b(...args);
				c && c(...args);
			}
		}

		let translator = new TSTranslater().init()
		let tr: TSTranslater = Object.create(null)
		for (let key in translator) {
			let f = translator[key]
			if (typeof (f) == "function") {
				tr[key] = f.bind(translator)
			}
		}

		let Any = exactly("")
		let OpV1 = exactly(/[\+\-]/)
		let OpV2 = exactly(/[\*\/]/)
		let OpAll = union([OpV1, OpV2])
		let White = exactly(/\s/)
		let $White = exactly(/\s*/)
		let Word = exactly(/[a-zA-Z_\$][0-9a-zA-Z_\$]*/)
		/**变量名 */
		let VarName = wrap(Word)
		/**常量声明 */
		let ConstNumber = exactly(/[0-9\.]+/).wf(tr.pushConst).named("ConstNumber")
		let Let = exactly("let")
		let Let_s = sequence([Let, White])
		let Export = exactly("export")
		let Export_s = sequence([Export, White])
		/**局部声明表达式 */
		let DeclareLocalVarStatement = sequence([Let_s, VarName.wf(tr.declareLocalVar), $White,])
		/**赋值操作符: = */
		let Assign = sequence([exactly(/[\=]/), not(OpAll).unconsume()])
		/**成员索引 */
		let MemberIndexer = exactly(".")
		/**变量索引 */
		let VarRefer = sequence([VarName.wf(tr.referLocalVar), repeat(sequence([MemberIndexer, VarName]).wf(tr.indexVarMember))]).named("VarRefer")
		/**表达式值 */
		let Value = union([ConstNumber, VarRefer]).named("Value")
		/**操作符表达式 */
		let OpStatementV2 = (() => {
			let opResult: pgparser.MatchedResult
			let fop = (p: pgparser.MatchedResult) => {
				opResult = p
			}
			let fv2 = (p: pgparser.MatchedResult) => {
				tr.convOperation(opResult)
			}
			let matcher = sequence([Value,
				repeat(sequence([$White, OpV2.wf(fop), $White, Value.wf(fv2)])).timesMin(1)
			]).named("OpStatementV2")
			return matcher
		})();
		let OpStatementV1 = (() => {
			let opResult: pgparser.MatchedResult
			let fop = (p: pgparser.MatchedResult) => {
				opResult = p
			}
			let fv2 = (p: pgparser.MatchedResult) => {
				tr.convOperation(opResult)
			}
			let matcher = sequence([union([OpStatementV2, Value]),
			repeat(sequence([$White, OpV1.wf(fop), $White, union([OpStatementV2, Value]).wf(fv2)])).timesMin(1)
			]).named("OpStatementV1")
			return matcher
		})();
		/**操作符计算表达式 */
		let OpStatement = repeat(union([OpStatementV2, OpStatementV1]))
		/**
		 * 声明局部变量, 传入函数处理局部变量声明
		 * @param call 
		 */
		let genLocalAssign = (call: (p: pgparser.MatchedResult) => void) => {
			let opResult: pgparser.MatchedResult
			let fop = (p: pgparser.MatchedResult) => {
				opResult = p
			}
			let fv2 = (p: pgparser.MatchedResult) => {
				call(opResult)
			}
			return sequence([sequence([Let_s, VarName.wf(fop), $White,]),
				Assign, $White, OpStatement]).sf(fv2)
		}
		/**局部声明并赋值表达式 */
		let DeclareAndAssignLocalVarStatement = genLocalAssign(tr.declareAndAssignLocalVar)
		/**导出表达式 */
		let ExportStatement = sequence([Export_s, genLocalAssign(tr.exportVar)])
		/**语句 */
		let Sentence = union([ExportStatement, DeclareAndAssignLocalVarStatement,])
		/**会话块 */
		let Chunk = sequence([Any.wf(tr.enterSession), Sentence, Any.wf(tr.leaveSession)])

		export const parseRoot = Chunk
		/**
		 * 默认解析器
		 */
		export class Parser {
			/**
			 * 对表达式执行即时编译
			 */
			compile(content: string): CompileResult {
				translator.clear()
				let iterContext = new pgparser.IterContext().init(content)
				let result = parseRoot.consume(iterContext)
				if (result.isMatched) {
					iterContext.applySignals()
				}
				let compileResult = new CompileResult()
				compileResult.result = result
				compileResult.instructions = translator.cloneInstructions()
				return compileResult
			}

		}

	}

	export const TSParser = new parser.Parser()
}
