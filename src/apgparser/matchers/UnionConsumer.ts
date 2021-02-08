
namespace pgparser {
	/**
	 * 联合匹配
	 */
	export class UnionMatcher extends ConsumerBase {
		subMatchers: ConsumerBase[] = []

		init(subMatchers: ConsumerBase[], matchedSignal: MatchedSignal = null) {
			this.matchedSignal = matchedSignal
			this.subMatchers = subMatchers
			return this
		}

		match(iter: IterContext) {
			for (let subMatcher of this.subMatchers) {
				let result = subMatcher.match(iter)
				if (result.isMatched) {
					return result
				}
			}
			return FailedMatchResult(iter)
		}
	}
}