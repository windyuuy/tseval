
namespace pgparser {
	/**
	 * 仅仅匹配过滤, 信号不生效
	 */
	export class FilterConsumer extends ConsumerBase {
		protected subMatcher: ConsumerBase

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			return this
		}

		match(iter: IterContext) {
			let iterCopy = iter.clone()
			let result = this.subMatcher.match(iterCopy);
			return result
		}
	}

}