
namespace pgparser {
	/**
	 * 包装匹配
	 */
	export class WrapMatcher extends ConsumerBase {
		protected subMatcher: ConsumerBase

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			this.subMatcher = subMatcher
			this.name = subMatcher.name
			return this
		}

		match(iter: IterContext) {
			let result = this.subMatcher.test(iter);
			return result;
		}
	}

}