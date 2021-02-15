
namespace pgparser {
	/**
	 * 包装匹配
	 */
	export class NotConsumer extends ConsumerBase {
		protected subMatcher: ConsumerBase

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			return this
		}

		match(iter: IterContext) {
			let subResult = this.subMatcher.match(iter);
			if (subResult.isMatched) {
				return FailedMatchResult(iter, this, subResult, subResult, this)
			}

			let result = new MatchedResult(iter, this)
			result.isMatched = true
			result.loc = [iter.cursor, iter.cursor + 1]
			result.addSubResult(subResult)
			return result
		}
	}

}