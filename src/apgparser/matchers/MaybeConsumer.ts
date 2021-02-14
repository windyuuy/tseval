
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
			{
				let result = this.subMatcher.match(iter);
				if (result.isMatched) {
					// 匹配到一次, 则返回成功
					return result
				}
			}

			// 未匹配到则返回空匹配成功
			let result = new MatchedResult(iter);
			result.rawTarget = ""
			result.isMatched = true
			result.loc = iter.getUnmatchedLoc()
			result.times = 0
			return result
		}
	}

}