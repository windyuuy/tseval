
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

		/**
		 * 操作符匹配列表
		 * - 优先级从前往后依次升高
		 */
		const operatorLiterals = [
			"(?:\\*\\*)",
			"[\\*\\/\\%]",
			"[\\+\\-]",
		]

		// 所有操作符
		let OpAll = exactly(new RegExp(operatorLiterals.join("|"))).named("OpAll")
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
		let ReferValue = union([ConstNumber, ConstString, VarRefer.wf(tr.referVarAsValue)]).named("ReferValue")
		/**值表达式 */
		let ValueStatement = stand().named("ValueStatement")
		let CombinedValue = sequence([BracketL, ValueStatement, BracketR]).named("CombinedValue")
		let SimpleValue = stand().named("SimpleValue")
		//#region 操作符表达式
		/**
		 * 优先级从前往后依次降低
		 */
		let operationStatements: pgparser.ConsumerBase[] = []
		{
			let lastOpStatement: pgparser.ConsumerBase = null
			operatorLiterals.forEach((opReg, index) => {
				let OpStatementVz2 = (() => {
					let OpVz2 = exactly(new RegExp(opReg)).named(`OpV${index}`)
					let SubValue: pgparser.ConsumerBase
					if (lastOpStatement) {
						SubValue = union([lastOpStatement, SimpleValue])
					} else {
						SubValue = SimpleValue
					}
					let matcher = sequence([SubValue,
						repeat(
							sequence([$White, OpVz2.wf(tr.convOperation), $White, SubValue]).reverseSubSignals()
						).timesMin(1)
					]).named(`OpStatementV${index}`)
					return matcher
				})();
				operationStatements.push(OpStatementVz2)
				lastOpStatement = OpStatementVz2
			})
		}
		/**操作符计算表达式 */
		let OpStatement = repeat(union(operationStatements)).timesMin(1).named("OpStatement")
		//#endregion
		// 递归声明
		ValueStatement.assign(union([CombinedValue, OpStatement, ReferValue,]))
		// 需要从中剔除操作符表达式, 避免无限递归
		SimpleValue.assign((ValueStatement.raw as pgparser.UnionMatcher).clone().sub([OpStatement]))
		/**
		 * 声明局部变量, 传入函数处理局部变量声明
		 * @param call 
		 */
		let genLocalDeclare = (call: (p: pgparser.MatchedResult) => void) => {
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
			compile(content: string, env: Object): CompileResult {
				translator.clear()
				let iterContext = new pgparser.IterContext().init(content)
				let result = parseRoot.consume(iterContext)
				if (result.isMatched) {
					translator.importLocalEnv(env)
					iterContext.applySignals()
				}
				let compileResult = new CompileResult()
				compileResult.parseResult = result
				compileResult.instructions = translator.cloneInstructions()
				compileResult.runtimeWaver = translator.cloneRuntimeWaver()
				return compileResult
			}

		}

	}

	export const TSParser = new parser.Parser()
}
