
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
			let wrap = new WrapMatcher().init(this, matchedSignal)
			return wrap
		}

		// clone(): ConsumerBase {
		// 	let clone = new ConsumerBase()
		// 	clone.needConsume = this.needConsume
		// 	clone.matchedSignal = this.matchedSignal
		// 	clone.name = this.name
		// 	return clone
		// }

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
					// 需要拆分为两步, 否则会被编译成 f.bind(this), 错误执行
					// let f = this.matchedSignal
					// f(result)
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
