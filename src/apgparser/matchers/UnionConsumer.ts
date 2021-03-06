
namespace pgparser {
	/**
	 * 联合匹配
	 */
	export class UnionConsumer extends ConsumerBase {
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
			return FailedMatchResult(iter, this, resultO, resultO, this)
		}

		/**
		 * 复制
		 */
		copy(it: ConsumerBase): UnionConsumer {
			this.needConsume = it.needConsume
			this.matchedSignal = it.matchedSignal
			this.name = it.name
			if (it instanceof UnionConsumer) {
				this.subMatchers = it.subMatchers.concat()
			}
			return this
		}

		/**
		 * 复制
		 */
		clone(): UnionConsumer {
			let clone = new UnionConsumer()
			clone.copy(this)
			return clone
		}

		/**
		 * 求出差集
		 * @param subMatchers 
		 */
		sub(subMatchers: ConsumerBase[]): UnionConsumer {
			let selfSubMatchers = this.subMatchers
			for (let i = selfSubMatchers.length - 1; i >= 0; i--) {
				let matcher = selfSubMatchers[i]
				if (subMatchers.indexOf(matcher) >= 0) {
					selfSubMatchers.splice(i, 1)
				}
			}
			return this
		}

	}
}