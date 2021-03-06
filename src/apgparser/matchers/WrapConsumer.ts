
namespace pgparser {
	/**
	 * 包装匹配
	 */
	export class WrapConsumer extends ConsumerBase {
		protected subMatcher: ConsumerBase

		init(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal
			if (subMatcher) {
				this.subMatcher = subMatcher
				this.name = subMatcher.name
			}
			return this
		}

		match(iter: IterContext) {
			let result = this.subMatcher.test(iter);
			return result;
		}

		/**
		 * 分配实体
		 * @param subMatcher 
		 */
		assign(subMatcher: ConsumerBase) {
			this.subMatcher = subMatcher
		}

		/**
		 * 获取原始匹配器
		 */
		get raw() {
			return this.subMatcher
		}
	}

}