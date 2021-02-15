
namespace pgparser {
	/**
	 * 失败匹配, 必定失败
	 */
	export class FailConsumer extends ConsumerBase {

		init(matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal;
			return this
		}

		match(iter: IterContext) {
			let result = new MatchedResult(iter, this);

			result.rawTarget = ""
			result.isMatched = false
			result.loc = iter.getUnmatchedLoc()

			return result
		}
	}

	/**
	 * 全局共享失败匹配
	 */
	export const CFail = new FailConsumer().init()
}
