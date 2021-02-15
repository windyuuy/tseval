
namespace pgparser {
	/**
	 * 限制0~1次匹配
	 */
	export class MaybeConsumer extends ConsumerBase {
		protected subMatcher: ConsumerBase

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			return this
		}

		match(iter: IterContext) {
			let subResult = this.subMatcher.match(iter);
			if (subResult.isMatched) {
				// 匹配到一次, 则返回成功
				return subResult
			}

			// 未匹配到则返回空匹配成功
			let result = new MatchedResult(iter, this);
			result.rawTarget = ""
			result.isMatched = true
			result.loc = iter.getUnmatchedLoc()
			result.times = 0
			result.addSubResult(subResult)
			return result
		}
	}

}