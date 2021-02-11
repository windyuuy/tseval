
namespace pgparser {
	/**
	 * 无效匹配, 必定异常
	 */
	export class InvalidConsumer extends ConsumerBase {

		init(matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal;
			return this
		}

		match(iter: IterContext) {
			let result = new MatchedResult(iter);

			result.rawTarget = ""
			result.isMatched = false
			result.loc = iter.getUnmatchedLoc()

			throw new Error()

			return result
		}
	}

	/**
	 * 全局共享异常匹配
	 */
	export const CInvalid = new InvalidConsumer().init()
}
