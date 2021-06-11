
/// <reference path="./TSTranslater.ts" />

namespace tseval {
	const { exactly, sequence, union, repeat, wrap, not, docend, stand, maybe, repeatWithSeperator, predict, } = pgparser.MatcherFactory
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
		let None = exactly("").named("None")
		/**符号 ( */
		let BracketL = exactly("(").named("BracketL")
		/**符号 ) */
		let BracketR = exactly(")").named("BracketR")
		/**符号 { */
		let BraceL = exactly("{").named("BraceL")
		/**符号 } */
		let BraceR = exactly("}").named("BraceR")
		/**方括号[ */
		let SqBracketL = exactly("[").named("SqBracketL")
		/**方括号] */
		let SqBracketR = exactly("]").named("SqBracketR")
		/**胖括号 */
		let FatArrow = exactly("=>").named("FatArrow")
		/**窄括号 */
		let NarrowArrow = exactly("->").named("NarrowArrow")
		/**函数声明前缀 */
		let FuncPrefix = exactly("function").named("FuncPrefix")

		/**
		 * 操作符匹配列表
		 * - 优先级从前往后依次降低
		 */
		const operatorLiterals = [
			{ reverse: true, name: "", reg: /(?:\*\*)/, },
			{ reverse: false, name: "", reg: /[\*\/\%]/, },
			{ reverse: false, name: "", reg: /[\+\-]/, },
			{ reverse: false, name: "", reg: /(?:\<\<)|(?:\>\>\>)|(?:\>\>)/, },
			{ reverse: false, name: "", reg: /(?:\<\=)|(?:\<)|(?:\>\=)|(?:\>)|(?:instanceof)|(?:in)/, },
			{ reverse: false, name: "", reg: /(?:\=\=\=)|(?:\!\=\=)|(?:\=\=)|(?:\!\=)/, },
			{ reverse: false, name: "", reg: /(?:\&)/, },
			{ reverse: false, name: "", reg: /(?:\^)/, },
			{ reverse: false, name: "", reg: /(?:\|)/, },
			{ reverse: false, name: "", reg: /(?:\&\&)/, },
			{ reverse: false, name: "", reg: /(?:\|\|)/, },
			{ reverse: false, name: "", reg: /(?:\?\?)/, },
		]

		// 所有操作符
		let OpAll = exactly(new RegExp(operatorLiterals.map(r => r.reg.source).join("|"))).named("OpAll")
		/**空白符 */
		let White = exactly(/\s/).named("White")
		/**可空的空白符 */
		let $White = exactly(/\s*/).named("$White")
		/**分号 */
		let Semicolon = exactly(";").named("Semicolon")
		/**逗号 */
		let Comma = exactly(",").named("Comma")
		/**行分隔符号 */
		let LineSeperator = exactly(/\n/).named("LineSeperator")
		/**语句分隔符 */
		let SentenceSeperator = sequence([$White, union([Semicolon, LineSeperator, DocEnd,])]).named("SentenceSeperator")
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
		/**导出词缀 */
		let Export = exactly("export").named("Export")
		/**导出词缀 */
		let Export_s = sequence([Export, White]).named("Export_s")

		/**块注释头 */
		let BlockCommentBegin = exactly(/\/\*/).named("BlockCommentBegin")
		/**块注释尾 */
		let BlockCommentEnd = exactly(/\*\//).named("BlockCommentEnd")
		/**块注释 */
		let BlockComment = sequence([BlockCommentBegin, repeat(not(BlockCommentEnd)), BlockCommentEnd]).named("BlockComment")
		BlockComment.sf(tr.captureBlockComment)
		/**行注释头 */
		let LineCommentHead = exactly(/\/\//).named("LineCommentHead")
		/**行注释 */
		let LineComment = sequence([LineCommentHead, repeat(not(LineSeperator)), LineSeperator.unconsume()]).named("LineComment")
		LineComment.sf(tr.captureLineComment)
		/**局部声明表达式 */
		let DeclareLocalVarStatement = sequence([LetDeclare_s, VarName.wf(tr.declareLocalVar), $White,]).named("DeclareLocalVarStatement")
		/**赋值操作符: = */
		let Assign = sequence([exactly(/[\=]/), not(OpAll).unconsume()]).named("Assign")
		/**成员索引 */
		let MemberIndexer = exactly(".").named("MemberIndexer")
		let MemberOptionalChaining = exactly("?.").named("MemberOptionalChaining")
		/**变量索引 */
		let VarRefer = sequence([VarName.wf(tr.referLocalVar), repeat(union([
			sequence([MemberIndexer, VarName.wf(tr.indexVarMember)]).named("MemberAccess"),
			sequence([MemberOptionalChaining, VarName.wf(tr.optionalChaining)]).named("OptionalChaining"),
		]))]).named("VarRefer")
		/**表达式值 */
		let ReferValue = union([ConstNumber, ConstString, VarRefer.wf(tr.referVarAsValue)]).named("ReferValue")
		/**值表达式 */
		let ValueStatement = stand().named("ValueStatement")
		/**使用小括号联结的值 */
		let CombinedValue = sequence([BracketL, ValueStatement, BracketR]).named("CombinedValue")
		/**剔除了操作符算式的值表达式 */
		let SimpleValue = stand().named("SimpleValue")
		/**右递归表达式 */
		let RecursiveValue1 = stand().named("RecursiveValue1")
		/**双边递归表达式 */
		let RecursiveValue2 = stand().named("RecursiveValue2")
		//#region 操作符表达式

		/**调用函数时传参 */
		let CallParams = repeatWithSeperator(repeat(sequence([VarName, Comma,]))).named("CallParams")
		/**
		 * 函数定义
		 * - 形如: {|...params| body;}
		 */
		let FuncCallDeco = sequence([BracketL, CallParams, BracketR,]).sf(tr.callFunction).named("FuncCallDeco")

		/**
		 * 优先级从前往后依次降低
		 */
		// let operationStatements: pgparser.ConsumerBase[] = []
		let OpValue: pgparser.ConsumerBase = null
		{
			let lastValue: pgparser.ConsumerBase = RecursiveValue1
			operatorLiterals.forEach((opReg, index) => {
				let OpStatementVz2 = (() => {
					let OpVz2 = exactly(opReg.reg).named(`OpV${index}`)
					// let matcher = sequence([lastValue, repeater.clone().timesMin(1)]).named(`OpStatementV${index}`)
					if (opReg.reverse) {
						let repeater = repeat(
							sequence([$White, lastValue, $White, OpVz2.wf(tr.convOperation),])
						).reverseSubSignals()
						let newValue = sequence([repeater, lastValue,]).reverseSubSignals().named(`OpStatementV${index}`)
						lastValue = newValue
					} else {
						let repeater = repeat(
							sequence([$White, OpVz2.wf(tr.convOperation), $White, lastValue]).reverseSubSignals()
						)
						let newValue = sequence([lastValue, repeater.named(`OpRepeater${index}`),]).named(`OpStatementV${index}`)
						lastValue = newValue
					}
					// return matcher
				})();
				// operationStatements.push(OpStatementVz2)
			})
			let OpFilter = predict(sequence([RecursiveValue1, $White, OpAll,])).named("OpFilter")
			OpValue = sequence([OpFilter, lastValue,]).named("OpValue")
			// OpValue = lastValue.named("OpValue")
		}
		/**操作符计算表达式 */
		// let OpStatement = repeat(union(operationStatements)).timesMin(1).named("OpStatement")
		//#endregion

		let FuncParamDefBegin = exactly(/\(/).named("FuncParamDefBegin")
		let FuncParamDefEnd = exactly(/\)/).named("FuncParamDefEnd")
		let Params = repeatWithSeperator(repeat(sequence([VarName, Comma,])))
		/**函数参数定义 */
		let FuncParamDef = sequence([FuncParamDefBegin,
			// maybe(sequence([VarName, repeat(sequence([Comma, VarName,]))])),
			Params,
			FuncParamDefEnd,])
		/**函数体会话块定义 */
		let FuncBodyChunk = stand().named("FuncBodyChunk")
		/**()=>{xxx} */
		let ComplexLambdaDef = sequence([FuncParamDef, FatArrow, BraceL, maybe(FuncBodyChunk), BraceR])
		/**()=>xxx */
		let SimpleLambdaDef = sequence([FuncParamDef, FatArrow, ValueStatement])
		/**lambda函数体定义 */
		let LambdaDef = union([SimpleLambdaDef, ComplexLambdaDef])
		/**匿名函数定义 */
		let AnonymousFuncDef = sequence([FuncPrefix, FuncParamDef, BraceL, maybe(FuncBodyChunk), BraceR])
		/**函数名 */
		let FuncName = wrap(Word).named("FuncName")
		/**命名函数定义 */
		let NamedFuncDef = sequence([FuncPrefix, White, FuncName, $White, FuncParamDef, BraceL, maybe(FuncBodyChunk), BraceR])
		let FuncDef = union([NamedFuncDef, AnonymousFuncDef])
		let CallableDef = union([FuncDef, LambdaDef])

		// 需要从中剔除操作符表达式, 避免无限递归
		// SimpleValue.assign((ValueStatement.raw as pgparser.UnionConsumer).clone().sub([OpStatement]))
		SimpleValue.assign(union([CombinedValue, CallableDef, ReferValue,]))
		let AssignVarStatement = stand().named("AssignVarStatement")
		RecursiveValue1.assign(union([AssignVarStatement, sequence([SimpleValue, repeat(union([FuncCallDeco])),])]))
		RecursiveValue2.assign(union([OpValue]))
		// 递归声明
		ValueStatement.assign(union([RecursiveValue2, RecursiveValue1,]))
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
		/**导出声明表达式 */
		let ExportAndDeclareStatement = sequence([Export_s, genLocalDeclare(tr.exportWithDeclareVar)]).named("ExportAndDeclareStatement")
		/**导出表达式 */
		let ExportStatement = sequence([Export_s, VarRefer.wf(tr.referVarAsValue).wf(tr.exportVar), wrap(SentenceSeperator).unconsume()]).named("ExportStatement")
		/**变量赋值 */
		AssignVarStatement.assign((() => {
			return sequence([VarRefer.wf(tr.assignLocalVar), $White, Assign, $White, ValueStatement])
				.reverseSubSignals()
		})())
		let ValueStatementSentence = ValueStatement
		/**语句 */
		let Sentence = union([
			LineComment,
			BlockComment,
			ExportAndDeclareStatement,
			ExportStatement,
			DeclareAndAssignLocalVarStatement,
			AssignVarStatement,
			ValueStatementSentence,
		]).named("Sentence")
		/**会话块 */
		let Chunk = stand().named("Chunk")
		let ChunkContent = repeat(sequence([$White, union([
			// sequence([Chunk, union([DocEnd, Semicolon, $White,])]),
			// sequence([Sentence, $White, union([DocEnd, Semicolon, LineSeperator, union([BraceR, BracketR]).unconsume()])]),
			repeat(sequence([$White, union([Chunk, Sentence]), union([DocEnd, Semicolon, $White,]),])).timesMin(1).named("MutiSentence"),
		]),])).timesMin(1).named("ChunkContent")
		Chunk.assign(sequence([
			BraceL.wf(tr.enterSession),
			maybe(ChunkContent),
			BraceR.wf(tr.leaveSession)
		]))
		/**文档级会话块 */
		let DocChunk = sequence([
			None.wf(tr.enterSession),
			ChunkContent,
			None.wf(tr.leaveSession)
		]).named("DocChunk")
		// 函数体块形似文档级会话块
		FuncBodyChunk.assign(ChunkContent)
		/**文档 */
		let Document = sequence([$White, repeat(DocChunk), $White, DocEnd]).named("Document")

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
