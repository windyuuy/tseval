
namespace pgparser {
	/**
	 * 联合匹配
	 */
	export class UnionMatcher extends ConsumerBase {
		subMatchers: ConsumerBase[] = []

		init(subMatchers: ConsumerBase[], matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatchers = subMatchers
			return this
		}

		match(iter: IterContext) {
			let resultO: pgparser.MatchedResult
			for (let subMatcher of this.subMatchers) {
				// 对于每一次独立尝试都要创建新的副本
				let iterCopy = iter.clone()
				let result = subMatcher.consume(iterCopy)
				if (result.isMatched) {
					iter.mergeSimulated(iterCopy)
					return result
				}

				resultO = result
			}
			return FailedMatchResult(iter, resultO, this)
		}
	}
}