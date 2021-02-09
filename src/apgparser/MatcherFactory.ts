
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
	}

	export const MatcherFactory = new TMatcherFactory()
}