
namespace pgparser {
	/**
	 * 串联匹配
	 */
	export class SequenceMatcher extends ConsumerBase {
		subMatchers: ConsumerBase[] = []

		init(subMatchers: ConsumerBase[], matchedSignal: MatchedSignal = null) {
			this.matchedSignal = matchedSignal
			this.subMatchers = subMatchers
			return this
		}

		match(iter: IterContext) {
			let iterCopy = iter.clone()
			for (let subMatcher of this.subMatchers) {
				let result = subMatcher.consume(iterCopy)
				if (!result.isMatched) {
					return FailedMatchResult(iter)
				}
			}

			let result = new MatchedResult(iter)
			result.isMatched = true
			result.loc = iter.getLocByDiff(iterCopy)
			return result
		}
	}
}
