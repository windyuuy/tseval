
namespace pgparser {
	/**
	 * 重复执行匹配(贪婪匹配)
	 */
	export class RepeatMatcher extends ConsumerBase {
		protected subMatcher: ConsumerBase

		/**
		 * 匹配次数限定符
		 */
		protected matchTimes: Number2 = [-Infinity, Infinity]

		/**
		 * 限定匹配次数修饰
		 * @param matchTimes 
		 */
		times(matchTimes: Number2) {
			this.matchTimes = matchTimes
		}

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignal = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			return this
		}

		match(iter: IterContext) {
			let timesMin = this.matchTimes[0]
			timesMin = Math.max(timesMin, 0)

			let subMatcher = this.subMatcher
			let iterCopy = iter.clone()

			// 进行最小匹配, 必须满足最小匹配才算成功
			for (let i = 0; i < timesMin; i++) {
				let result = subMatcher.consume(iterCopy)
				if (!result.isMatched) {
					return FailedMatchResult(iter)
				}
			}

			// 进行最大匹配, 求取最大匹配次数
			let timesMax = this.matchTimes[1]
			let matchedTimes = timesMin
			for (let i = timesMin; i < timesMax; i++) {
				let result = subMatcher.consume(iterCopy)
				if (!result.isMatched) {
					break
				} else {
					matchedTimes += 1
				}
			}

			// 整合匹配结果
			let result = new MatchedResult(iter)
			result.times = matchedTimes
			result.isMatched = true
			result.loc = iter.getLocByDiff(iterCopy)
			return result
		}
	}
}
