
namespace pgparser {
	/**
	 * 串联匹配
	 */
	export class SequenceMatcher extends ConsumerBase {
		subMatchers: ConsumerBase[] = []

		init(subMatchers: ConsumerBase[], matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatchers = subMatchers
			return this
		}

		match(iter: IterContext) {
			/**
			 * 由于不确定是否全部匹配, 所以需要创建副本, 避免串联不完全匹配导致的消耗
			 */
			let iterCopy = iter.clone()
			for (let subMatcher of this.subMatchers) {
				let result = subMatcher.consume(iterCopy)
				if (!result.isMatched) {
					return FailedMatchResult(iter, result, subMatcher)
				}
			}

			let result = new MatchedResult(iter)
			result.isMatched = true
			result.loc = iter.getLocByDiff(iterCopy)
			iter.mergeSimulated(iterCopy)
			return result
		}
	}
}
