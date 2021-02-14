
namespace pgparser {
	/**
	 * 有可选分隔符匹配
	 */
	export class RepeatWithSeperatorConsumer extends ConsumerBase {
		subMatcher: RepeatConsumer = null

		protected subRepeater: RepeatConsumer = null;
		protected subSequence: SequenceConsumer = null;
		protected subRepeaterWithoutSeperator: RepeatConsumer = null;

		init(subMatcher: RepeatConsumer, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher

			// 检查规格
			this.subRepeater = this.subMatcher.clone()
			let subSequence = this.subMatcher["subMatcher"]
			if (!(subSequence instanceof SequenceConsumer)) {
				// 必须是 this/repeat/sequence
				throw new Error("必须是 this/repeat/sequence")
			}
			this.subSequence = subSequence.clone()
			let subMatchers = this.subSequence.subMatchers
			if (subMatchers.length < 2) {
				throw new Error("必须有分隔符")
			}
			subMatchers.length = subMatchers.length - 1

			return this
		}

		match(iter: IterContext) {
			let [timesMin, timesMore, timesMax,] = this.subMatcher.getMatchTimes()
			let repeatMatcher = this.subRepeater
			// 降低下限
			repeatMatcher.timesMin(timesMin - 1)
			repeatMatcher.timesMore(timesMore)
			repeatMatcher.timesMax(timesMax)
			// 探测实际匹配数
			let iterCopy = iter.clone()
			let result = repeatMatcher.consume(iterCopy)
			let times = result.times
			if (result.isMatched) {
				if (times <= timesMore - 1 && times < timesMax) {
					// 仅差一次匹配, 那么尝试无分隔符匹配
					let subSequence = this.subSequence
					let endResult = subSequence.consume(iterCopy)
					if (endResult.isMatched) {
						times += 1
						result.times += 1
						result.loc[1] = endResult.loc[1]
					}
				}

				if (times >= timesMin && times <= timesMore && times <= timesMax) {
					iter.mergeSimulated(iterCopy)
					return result
				}
			}
			return FailedMatchResult(iter)
		}

	}
}
