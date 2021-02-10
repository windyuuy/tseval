
/// <reference path="./TSTranslater.ts" />

namespace tseval {
	const { exactly, sequence, union, repeat, wrap, not, docend, } = pgparser.MatcherFactory
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

		let DocEnd = docend().named("DocEnd")
		let Any = exactly("").named("Any")
		let OpV1 = exactly(/[\+\-]/).named("OpV1")
		let OpV2 = exactly(/[\*\/]/).named("OpV2")
		let OpAll = union([OpV1, OpV2]).named("OpAll")
		let White = exactly(/\s/).named("White")
		let $White = exactly(/\s*/).named("$White")
		let Word = exactly(/[a-zA-Z_\$][0-9a-zA-Z_\$]*/).named("Word")
		/**变量名 */
		let VarName = wrap(Word).named("VarName")
		/**常量声明 */
		let ConstNumber = exactly(/[0-9\.]+/).wf(tr.pushConst).named("ConstNumber")
		let Let = exactly("let").named("Let")
		let Let_s = sequence([Let, White]).named("Let_s")
		let Export = exactly("export").named("Export")
		let Export_s = sequence([Export, White]).named("Export_s")
		/**局部声明表达式 */
		let DeclareLocalVarStatement = sequence([Let_s, VarName.wf(tr.declareLocalVar), $White,]).named("DeclareLocalVarStatement")
		/**赋值操作符: = */
		let Assign = sequence([exactly(/[\=]/), not(OpAll).unconsume()]).named("Assign")
		/**成员索引 */
		let MemberIndexer = exactly(".").named("MemberIndexer")
		/**变量索引 */
		let VarRefer = sequence([VarName.wf(tr.referLocalVar), repeat(sequence([MemberIndexer, VarName]).wf(tr.indexVarMember))]).named("VarRefer")
		/**表达式值 */
		let Value = union([ConstNumber, VarRefer]).named("Value")
		//#region 操作符表达式
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
		let OpStatement = repeat(union([OpStatementV2, OpStatementV1])).timesMin(1).named("OpStatement")
		//#endregion
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
			// let $var = $opstatement | $value
			return sequence([sequence([Let_s, VarName.wf(fop), $White,]),
				Assign, $White, union([OpStatement, Value])]).sf(fv2)
		}
		/**局部声明并赋值表达式 */
		let DeclareAndAssignLocalVarStatement = genLocalAssign(tr.declareAndAssignLocalVar).named("DeclareAndAssignLocalVarStatement")
		/**导出表达式 */
		let ExportStatement = sequence([Export_s, genLocalAssign(tr.exportVar)]).named("ExportStatement")
		/**语句 */
		let Sentence = union([ExportStatement, DeclareAndAssignLocalVarStatement,]).named("Sentence")
		/**会话块 */
		let Chunk = sequence([
			Any.wf(tr.enterSession),
			repeat(sequence([$White, Sentence, White,])).timesMin(1).named("MutiSentence"),
			Any.wf(tr.leaveSession)
		]).named("Chunk")
		/**文档 */
		let Document = sequence([$White, repeat(Chunk), $White, DocEnd]).named("Document")

		export const parseRoot = Document
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
