
namespace pgparser {
	/**
	 * 空匹配, 必定成功
	 */
	export class EmptyConsumer extends ConsumerBase {

		init(matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal;
			return this
		}

		match(iter: IterContext) {
			let result = new MatchedResult(iter);

			result.rawTarget = ""
			result.isMatched = true
			result.loc = iter.getUnmatchedLoc()

			return result
		}
	}

	/**
	 * 全局共享空匹配
	 */
	export const CEmpty = new EmptyConsumer().init()
}
