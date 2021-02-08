
namespace tseval {
	const { exactly, sequence, union, repeat, wrap, not, } = pgparser.MatcherFactory
	namespace parser {
		let Operator = exactly(/[\+\-\*\/]/)
		let White = exactly(/\s/)
		let $White = exactly(/\s*/)
		let Word = exactly(/[a-zA-Z_\$][0-9a-zA-Z_\$]*/)
		let VarName = wrap(Word)
		let ConstNumber = exactly(/[0-9\.]+/)
		let Let = exactly("let")
		let Let_s = sequence([Let, White])
		let Export = exactly("export")
		let Export_s = sequence([Export, White])
		let Assign = sequence([exactly(/[\=]/), not(Operator).unconsume()])
		let Value = union([ConstNumber, VarName])
		let Statement = sequence([Value, $White, repeat(sequence([Operator, $White, Value]))])
		let ExportStatement = sequence([Export_s, Let_s, VarName, $White, Assign, $White, Statement])
		export const parseRoot = ExportStatement
		/**
		 * 默认解析器
		 */
		export class Parser {
			/**
			 * 对表达式执行即时编译
			 */
			compile(content: string) {
				let iterContext = new pgparser.IterContext().init(content)
				let result = parseRoot.consume(iterContext)
				return result
			}

		}

	}

	export const TSParser = new parser.Parser()
}
