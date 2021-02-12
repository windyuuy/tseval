
/// <reference path="./TSTranslater.ts" />

namespace tseval {
	const { exactly, sequence, union, repeat, wrap, not, docend, stand, } = pgparser.MatcherFactory
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

		/**标记文档末尾 */
		let DocEnd = docend().named("DocEnd")
		let Any = exactly("").named("Any")
		let BracketL = exactly("(").named("BracketL")
		let BracketR = exactly(")").named("BracketR")
		let BraceL = exactly("{").named("BraceL")
		let BraceR = exactly("}").named("BraceR")
		let OpV1 = exactly(/[\+\-]/).named("OpV1")
		let OpV2 = exactly(/[\*\/\%]/).named("OpV2")
		let OpV3 = exactly(/\*\*/).named("OpV3")
		let OpAll = union([OpV1, OpV2]).named("OpAll")
		/**空白符 */
		let White = exactly(/\s/).named("White")
		/**可空的空白符 */
		let $White = exactly(/\s*/).named("$White")
		/**分号 */
		let Semicolon = exactly(";").named("Semicolon")
		/**引号 */
		let Quot = exactly("\"").named("Quot").named("Quot")
		/**大引号开头 */
		let BigQuotBegin = exactly("'<").named("BigQuotBegin")
		/**大引号收尾 */
		let BigQuotEnd = exactly(">'").named("BigQuotEnd")
		let Word = exactly(/[a-zA-Z_\$][0-9a-zA-Z_\$]*/).named("Word")
		/**变量名 */
		let VarName = wrap(Word).named("VarName")
		/**常量数字声明 */
		let ConstNumber = exactly(/[0-9\.]+/).wf(tr.pushConstNumber).named("ConstNumber")
		/**常量字符串声明 */
		let ConstShortString = exactly(/"[^"]*"/).wf(tr.pushConstString).named("ConstString")
		let ConstLongString = sequence([BigQuotBegin, repeat(not(BigQuotEnd)).sf(tr.pushLongConstString), BigQuotEnd]).named("ConstLongString")
		let ConstString = union([ConstShortString, ConstLongString])
		let Let = exactly("let").named("Let")
		let Let_s = sequence([Let, White]).named("Let_s")
		let Const = exactly("const").sf(tr.declareImmultableLocalVar).named("const")
		let Const_s = sequence([Const, White]).named("Const_s")
		let LetDeclare = union([Let, Const]).named("LetDeclare")
		let LetDeclare_s = sequence([LetDeclare, White]).named("LetDeclare_s")
		let Export = exactly("export").named("Export")
		let Export_s = sequence([Export, White]).named("Export_s")
		/**局部声明表达式 */
		let DeclareLocalVarStatement = sequence([LetDeclare_s, VarName.wf(tr.declareLocalVar), $White,]).named("DeclareLocalVarStatement")
		/**赋值操作符: = */
		let Assign = sequence([exactly(/[\=]/), not(OpAll).unconsume()]).named("Assign")
		/**成员索引 */
		let MemberIndexer = exactly(".").named("MemberIndexer")
		/**变量索引 */
		let VarRefer = sequence([VarName.wf(tr.referLocalVar), repeat(sequence([MemberIndexer, VarName]).wf(tr.indexVarMember))]).named("VarRefer")
		/**表达式值 */
		let ReferValue = union([ConstNumber, ConstString, VarRefer]).named("ReferValue")
		/**值表达式 */
		let ValueStatement = stand().named("ValueStatement")
		let CombinedValue = sequence([BracketL, ValueStatement, BracketR]).named("CombinedValue")
		let SimpleValue = stand().named("SimpleValue")
		//#region 操作符表达式
		let OpStatementV3 = (() => {
			// let opResult: pgparser.MatchedResult
			// let fop = (p: pgparser.MatchedResult) => {
			// 	opResult = p
			// }
			// let fvalue = (p: pgparser.MatchedResult) => {
			// 	tr.convOperation(opResult)
			// }
			let SubValue = SimpleValue
			let matcher = sequence([SubValue,
				repeat(sequence([$White, OpV3.wf(tr.convOperation), $White, SubValue]).reverseSubSignals()).timesMin(1)
			]).named("OpStatementV3")
			return matcher
		})();
		let OpStatementV2 = (() => {
			// let opResult: pgparser.MatchedResult
			// let fop = (p: pgparser.MatchedResult) => {
			// 	opResult = p
			// }
			// let fvalue = (p: pgparser.MatchedResult) => {
			// 	tr.convOperation(opResult)
			// }
			let SubValue = union([OpStatementV3, SimpleValue])
			let matcher = sequence([SubValue,
				repeat(sequence([$White, OpV2.wf(tr.convOperation), $White, SubValue]).reverseSubSignals()).timesMin(1)
			]).named("OpStatementV2")
			return matcher
		})();
		let OpStatementV1 = (() => {
			// let opResult: pgparser.MatchedResult
			// let fop = (p: pgparser.MatchedResult) => {
			// 	opResult = p
			// }
			// let fvalue = (p: pgparser.MatchedResult) => {
			// 	tr.convOperation(opResult)
			// }
			let SubValue = union([OpStatementV2, SimpleValue])
			let matcher = sequence([SubValue,
				repeat(sequence([$White, OpV1.wf(tr.convOperation), $White, SubValue]).reverseSubSignals()).timesMin(1)
			]).named("OpStatementV1")
			return matcher
		})();
		/**操作符计算表达式 */
		let OpStatement = repeat(union([OpStatementV3, OpStatementV2, OpStatementV1])).timesMin(1).named("OpStatement")
		//#endregion
		// 递归声明
		ValueStatement.assign(union([CombinedValue, OpStatement, ReferValue,]))
		// SimpleValue.assign(union([ReferValue, CombinedValue,]))
		SimpleValue.assign((ValueStatement.raw as pgparser.UnionMatcher).clone().sub([OpStatement]))
		/**
		 * 声明局部变量, 传入函数处理局部变量声明
		 * @param call 
		 */
		let genLocalDeclare = (call: (p: pgparser.MatchedResult) => void) => {
			// let opResult: pgparser.MatchedResult
			// let fop = (p: pgparser.MatchedResult) => {
			// 	opResult = p
			// }
			// let fvalue = (p: pgparser.MatchedResult) => {
			// 	call(opResult)
			// }
			// let $var = $opstatement | $value
			return sequence([sequence([LetDeclare_s, VarName.wf(call), $White,]),
				Assign, $White, ValueStatement]).reverseSubSignals()
		}
		/**局部声明并赋值表达式 */
		let DeclareAndAssignLocalVarStatement = genLocalDeclare(tr.declareAndAssignLocalVar).named("DeclareAndAssignLocalVarStatement")
		/**导出表达式 */
		let ExportStatement = sequence([Export_s, genLocalDeclare(tr.exportVar)]).named("ExportStatement")
		/**变量赋值 */
		let AssignVarStatement = (() => {
			// let opResult: pgparser.MatchedResult
			// let fop = (p: pgparser.MatchedResult) => {
			// 	opResult = p
			// }
			// let fvalue = (p: pgparser.MatchedResult) => {
			// 	tr.assignLocalVar(opResult)
			// }
			return sequence([VarRefer.wf(tr.assignLocalVar), $White, Assign, $White, ValueStatement])
				.reverseSubSignals()
		})();
		/**语句 */
		let Sentence = union([ExportStatement, DeclareAndAssignLocalVarStatement, AssignVarStatement,]).named("Sentence")
		/**会话块 */
		let Chunk = sequence([
			Any.wf(tr.enterSession),
			repeat(sequence([$White, Sentence, union([White, Semicolon, DocEnd]),])).timesMin(1).named("MutiSentence"),
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
				compileResult.runtimeWaver = translator.cloneRuntimeWaver()
				return compileResult
			}

		}

	}

	export const TSParser = new parser.Parser()
}
