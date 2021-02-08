
namespace pgparser {
	/**
	 * 包装匹配
	 */
	export class WrapMatcher extends ConsumerBase {
		protected subMatcher: ConsumerBase

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignal = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			return this
		}

		match(iter: IterContext) {
			let result = this.subMatcher.match(iter);
			if (result.isMatched) {

			}
			return result;
		}
	}

}