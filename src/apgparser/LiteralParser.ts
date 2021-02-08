
namespace pgparser {
	/**
	 * 文法解析
	 */
	export class LiteralParser {
		/**
		 * 解析词法
		 * @param text 
		 * @param matcher 
		 */
		parse(text: string, matcher: IMatcher): MatchedResult {
			let iter = new IterContext().init(text)
			let result = matcher.consume(iter)
			return result
		}
	}
}