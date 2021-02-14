
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
			{
				let result = this.subMatcher.match(iter);
				if (result.isMatched) {
					return FailedMatchResult(iter, result, this)
				}
			}

			let result = new MatchedResult(iter)
			result.isMatched = true
			result.loc = [iter.cursor, iter.cursor + 1]
			return result
		}
	}

}