
namespace pgparser {
	/**
	 * 检查文档剩余内容
	 */
	export class DocEndConsumer extends ConsumerBase {

		init(matchedSignal: MatchedSignalPulse) {
			this.matchedSignal = matchedSignal;
			return this
		}

		match(iter: IterContext) {
			let leftText = iter.leftText
			if (leftText.length > 0) {
				let result = new MatchedResult(iter)
				result.loc = iter.getUnmatchedLoc()
				result.loc[1] = iter.source.length - 1
				result.rawTarget = "DocEnd"
				result.fallMatcher = this
				result.reason = "无法解析的文档末尾"
				return result
			}

			let result = new MatchedResult(iter)
			result.isMatched = true
			result.loc = iter.getLoc(leftText)
			return result
		}
	}
}
