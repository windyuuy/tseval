
namespace pgparser {

	/**
	 * 消耗基类
	 */
	export class ConsumerBase implements IMatcher {
		/**
		 * 需要消耗
		 */
		needConsume: boolean = true

		/**
		 * 匹配成功信号
		 */
		matchedSignal: MatchedSignal

		clone(): ConsumerBase {
			let clone = new ConsumerBase()
			clone.needConsume = this.needConsume
			clone.matchedSignal = this.matchedSignal
			return clone
		}

		/**
		 * 标记不消耗
		 */
		unconsume() {
			this.needConsume = false
			return this
		}

		/**
		 * 直接匹配并消耗
		 * @param iter 
		 */
		consume(iter: IterContext): MatchedResult {
			let result = this.match(iter);
			if (result.isMatched && this.needConsume) {
				if (this.matchedSignal) {
					this.matchedSignal(result)
				}
				iter.forward(result.consume);
			}
			return result
		}

		/**
		 * 仅仅匹配并返回匹配结果, 不消耗
		 * @param iter 
		 */
		match(iter: IterContext): MatchedResult {
			return FailedMatchResult(iter)
		}
	}

	/**
	 * 匹配基类
	 */
	export class MatcherBase extends ConsumerBase {
		needConsume = false
	}

}
