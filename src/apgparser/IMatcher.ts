
namespace pgparser {
	/**
	 * 基础匹配协议
	 */
	export interface IMatcher {
		/**
		 * 直接匹配并消耗
		 * @param iter 
		 */
		consume(iter: IterContext): MatchedResult

		/**
		 * 仅仅匹配并返回匹配结果, 不消耗
		 * @param iter 
		 */
		match(iter: IterContext): MatchedResult
	}

}
