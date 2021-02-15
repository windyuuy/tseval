
namespace pgparser {
	/**
	 * 重复执行匹配(贪婪匹配)
	 */
	export class RepeatConsumer extends ConsumerBase {
		protected subMatcher: ConsumerBase

		/**
		 * 匹配次数限定符
		 * [timesMin,timesMore,timesMax,]
		 */
		protected matchTimes: Number3 = [-Infinity, Infinity, Infinity]

		/**
		 * 获取匹配次数信息
		 */
		getMatchTimes(): Number3 {
			return this.matchTimes
		}

		/**
		 * 限定匹配次数修饰
		 * @param matchTimes 
		 */
		times(matchTimes: Number3) {
			this.matchTimes = matchTimes
			return this
		}

		/**
		 * 限定最小匹配次数
		 * @param min 
		 */
		timesMin(min: number) {
			this.matchTimes[0] = min
			return this
		}
		/**
		 * 限定最大匹配次数, 实际消耗按此次数来
		 * - 在此次数内采用贪婪匹配
		 * @param more 
		 */
		timesMore(more: number) {
			this.matchTimes[1] = more
			return this
		}
		/**
		 * 限定最大匹配次数, 超过则失败
		 * @param max 
		 */
		timesMax(max: number) {
			this.matchTimes[1] = max
			this.matchTimes[2] = max
			return this
		}

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			return this
		}

		clone() {
			let clone = new RepeatConsumer()
			clone.copy(this)
			for (let i = 0; i < this.matchTimes.length; i++) {
				clone.matchTimes[0] = this.matchTimes[0]
			}
			clone.subMatcher = this.subMatcher
			return clone
		}

		match(iter: IterContext) {
			let finalResult = new MatchedResult(iter, this)

			let timesMin = this.matchTimes[0]
			timesMin = Math.max(timesMin, 0)

			let subMatcher = this.subMatcher
			// 针对可能的串联不完全匹配消耗问题, 创建副本
			let iterCopy = iter.clone()

			let subSignalsRecords: number[] = [0]

			// 进行最小匹配, 必须满足最小匹配才算成功
			for (let i = 0; i < timesMin; i++) {
				let result = subMatcher.consume(iterCopy)
				if (!result.isMatched) {
					return FailedMatchResult(iter, this, finalResult, result, this)
				}
				finalResult.addSubResult(result)
				if (this.isReverseSubSignals) {
					// 需要反转信号, 则标记反转刻度
					subSignalsRecords.push(iterCopy.matchedSignals.length)
				}
			}

			// 进行最大匹配, 求取最大匹配次数
			let timesMore = this.matchTimes[1]
			let matchedTimes = timesMin
			{
				for (let i = timesMin; i < timesMore; i++) {
					let result = subMatcher.consume(iterCopy)
					if (!result.isMatched) {
						break
					} else {
						matchedTimes += 1

						finalResult.addSubResult(result)
						if (this.isReverseSubSignals) {
							// 需要反转信号, 则标记反转刻度
							subSignalsRecords.push(iterCopy.matchedSignals.length)
						}
					}
				}
			}

			// 限定最大匹配次数(仅检查项)
			if (matchedTimes == timesMore) {
				let timesMax = this.matchTimes[2]
				let iterCopy2 = iterCopy.clone()
				let matchedTimes2 = timesMore
				// 先达到max
				for (let i = timesMore; i < timesMax; i++) {
					let result = subMatcher.match(iterCopy2)
					if (!result.isMatched) {
						// max内, 出现不匹配则判断不超过max
						break
					} else {
						matchedTimes2 += 1
						subMatcher.handleConsume(iterCopy2, result)
					}
				}

				// 尝试超过max
				if (matchedTimes2 == timesMax) {
					let result = subMatcher.match(iterCopy2)
					if (result.isMatched) {
						// 超过max, 失败
						return FailedMatchResult(iter, this, finalResult, result, this)
					}
				}
			}

			if (this.isReverseSubSignals) {
				// 反转信号序号
				// let subSignals: MatchedSignal[] = []
				// for (let i = subSignalsRecords.length - 1; i >= 1; i--) {
				// 	let r0 = subSignalsRecords[i - 1]
				// 	let r1 = subSignalsRecords[i]
				// 	let subSlice = iterCopy.matchedSignals.slice(r0, r1)
				// 	subSignals.push(...subSlice)
				// }
				// iterCopy.matchedSignals.length = 0
				// iterCopy.matchedSignals.push(...subSignals)
				iterCopy.resortSignalsByOrder(subSignalsRecords)
			}

			// 整合匹配结果
			finalResult.times = matchedTimes
			finalResult.isMatched = true
			finalResult.loc = iter.getLocByDiff(iterCopy)
			iter.mergeSimulated(iterCopy)
			return finalResult
		}
	}
}
