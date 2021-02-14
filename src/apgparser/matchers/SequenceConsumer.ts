
namespace pgparser {
	/**
	 * 串联匹配
	 */
	export class SequenceConsumer extends ConsumerBase {
		subMatchers: ConsumerBase[] = []

		init(subMatchers: ConsumerBase[], matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatchers = subMatchers
			return this
		}

		clone(): SequenceConsumer {
			let clone = new SequenceConsumer()
			clone.copy(this)

			clone.subMatchers.length = 0
			clone.subMatchers.push(...this.subMatchers)

			return clone
		}

		match(iter: IterContext) {
			/**
			 * 由于不确定是否全部匹配, 所以需要创建副本, 避免串联不完全匹配导致的消耗
			 */
			let iterCopy = iter.clone()

			let subSignalsRecords: number[] = [0]
			for (let subMatcher of this.subMatchers) {
				let result = subMatcher.consume(iterCopy)
				if (!result.isMatched) {
					return FailedMatchResult(iter, result, subMatcher)
				}
				if (this.isReverseSubSignals) {
					// 需要反转信号, 则标记反转刻度
					subSignalsRecords.push(iterCopy.matchedSignals.length)
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
			let result = new MatchedResult(iter)
			result.isMatched = true
			result.loc = iter.getLocByDiff(iterCopy)
			iter.mergeSimulated(iterCopy)
			return result
		}

		/**
		 * 分配实体
		 * @param subMatcher 
		 */
		assign(subMatchers: ConsumerBase[]) {
			this.subMatchers.length = 0
			this.subMatchers.push(...subMatchers)
			return this
		}

	}
}
