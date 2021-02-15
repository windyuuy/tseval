
namespace pgparser {

	/**
	 * 消耗基类
	 */
	export class ConsumerBase implements IMatcher {
		/**
		 * 命名, 调试用信息
		 */
		name: string;

		/**
		 * 需要消耗
		 */
		needConsume: boolean = true

		/**
		 * 匹配成功信号
		 */
		matchedSignal: MatchedSignalPulse

		/**
		* 反转子匹配列表传递信号的顺序
		*/
		protected isReverseSubSignals: boolean = false
		/**
		 * 反转子匹配列表传递信号的顺序
		 */
		reverseSubSignals() {
			this.isReverseSubSignals = true
			return this
		}

		/**
		 * 设置名称
		 * @param name 
		 */
		named(name: string) {
			this.name = name
			return this
		}

		/**
		 * 设置信号触发点
		 * @param matchedSignal 
		 */
		sf(matchedSignal: MatchedSignalPulse) {
			this.matchedSignal = matchedSignal
			return this
		}

		/**
		 * 设置信号触发点
		 * @param matchedSignal 
		 */
		wf(matchedSignal: MatchedSignalPulse) {
			let wrap = new WrapConsumer().init(this, matchedSignal)
			return wrap
		}

		/**
		 * 复制
		 */
		copy(it: ConsumerBase): ConsumerBase {
			this.needConsume = it.needConsume
			this.matchedSignal = it.matchedSignal
			this.name = it.name
			return this
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
			if (result.isMatched) {
				this.handleResult(iter, result)
				this.handleConsume(iter, result)
			}
			return result
		}

		/**
		 * 探测
		 * 仅匹配, 不消耗
		 * @param iter 
		 */
		test(iter: IterContext) {
			let result = this.match(iter);
			this.handleResult(iter, result)
			return result
		}

		/**
		 * 处理结果, 不消耗
		 * @param iter 
		 * @param result 
		 */
		handleResult(iter: IterContext, result: MatchedResult) {
			if (result.isMatched) {
				if (this.matchedSignal) {
					iter.pushSignal(this.matchedSignal, result)
				}
			}
		}

		/**
		 * 无论结果成功, 执行消耗
		 * @param iter 
		 * @param result 
		 */
		handleConsume(iter: IterContext, result: MatchedResult) {
			if (this.needConsume) {
				iter.forward(result.consumeLen);
			}
		}

		/**
		 * 仅仅匹配并返回匹配结果, 不消耗
		 * @param iter 
		 */
		match(iter: IterContext): MatchedResult {
			return FailedMatchResult(iter, this, null)
		}
	}

	/**
	 * 匹配基类
	 */
	export class MatcherBase extends ConsumerBase {
		needConsume = false
	}

}
