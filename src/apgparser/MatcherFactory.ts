
namespace pgparser {
	/**
	 * 匹配子工厂
	 */
	export class TMatcherFactory {

		/**
		 * 基本元素型
		 * @param matchState 
		 */
		exactly(matchState: MatcherStatement, matchedSignal: MatchedSignalPulse = null) {
			return new ExactlyConsumer().init(matchState, matchedSignal)
		}

		/**
		 * 串联型
		 * @param subMatchers 
		 */
		sequence(subMatchers: ConsumerBase[], matchedSignal: MatchedSignalPulse = null) {
			return new SequenceMatcher().init(subMatchers, matchedSignal)
		}

		/**
		 * 联合型
		 * @param subMatchers 
		 */
		union(subMatchers: ConsumerBase[], matchedSignal: MatchedSignalPulse = null) {
			return new UnionMatcher().init(subMatchers, matchedSignal)
		}

		/**
		 * 循环匹配
		 * @param subMatcher 
		 * @param matchedSignal 
		 */
		repeat(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			return new RepeatMatcher().init(subMatcher, matchedSignal)
		}

		/**
		 * 声明占位符号
		 * @param matchedSignal 
		 */
		stand(matchedSignal: MatchedSignalPulse = null) {
			return new WrapMatcher().init(CInvalid, matchedSignal)
		}

		/**
		 * 包装复用
		 * @param subMatcher 
		 * @param matchedSignal 
		 */
		wrap(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			return new WrapMatcher().init(subMatcher, matchedSignal)
		}

		/**
		 * 取反
		 * @param subMatcher 
		 * @param matchedSignal 
		 */
		not(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			return new NotMatcher().init(subMatcher, matchedSignal)
		}

		/**
		 * 空匹配, 必定成功
		 * @param matchedSignal 
		 */
		empty(matchedSignal: MatchedSignalPulse = null) {
			return new EmptyConsumer().init(matchedSignal)
		}

		/**
		 * 失败匹配, 必定失败
		 * @param matchedSignal 
		 */
		fail(matchedSignal: MatchedSignalPulse = null) {
			return new FailConsumer().init(matchedSignal)
		}

		/**
		 * 无效匹配, 必定异常
		 * @param matchedSignal 
		 */
		invalid(matchedSignal: MatchedSignalPulse = null) {
			return new InvalidConsumer().init(matchedSignal)
		}

		/**
		 * 限制0~1次匹配
		 * @param matchedSignal 
		 */
		maybe(subMatcher: ConsumerBase, matchedSignal: MatchedSignalPulse = null) {
			return new MaybeConsumer().init(subMatcher, matchedSignal)
		}

		/**
		 * 匹配文档末尾
		 * @param matchedSignal 
		 */
		docend(matchedSignal: MatchedSignalPulse = null) {
			return new DocEndConsumer().init(matchedSignal)
		}
	}

	export const MatcherFactory = new TMatcherFactory()
}