
namespace pgparser {
	/**
	 * 基础匹配
	 */
	export class ExactlyConsumer extends ConsumerBase {
		/**
		 * 词源
		 */
		word: string;
		/**
		 * 正则
		 */
		reg: RegExp;
		matchFunc: MatcherFunc

		init(matchState: MatcherStatement, matchedSignal: MatchedSignalPulse = null) {
			this.matchedSignal = matchedSignal;

			if (typeof (matchState) == "string") {
				this.word = matchState
			} else if (matchState instanceof RegExp) {
				this.reg = matchState
			} else if (typeof (matchState) == "function") {
				this.matchFunc = matchState
			} else {
				throw new TSICompileError("state type not implemented.")
			}
			return this
		}

		match(iter: IterContext) {
			let result = new MatchedResult(iter);

			if (this.word != null) {
				let text = iter.slice(this.word.length)
				if (text == this.word) {
					result.isMatched = true
					result.loc = iter.getLoc(text)
				} else {
					result.rawTarget = this.word
					result.loc = iter.getUnmatchedLoc()
					result.fallMatcher = this
				}
			} else if (this.reg) {
				let leftText = iter.leftText
				let m = this.reg.exec(leftText)
				if (m && m.index == 0) {
					result.isMatched = true
					result.loc = iter.getLoc(m[0])
				} else {
					result.rawTarget = this.reg
					result.loc = iter.getUnmatchedLoc()
					result.fallMatcher = this
				}
			} else if (this.matchFunc) {
				let customeResult = this.matchFunc(iter)
				if (customeResult.isMatched) {
					result.isMatched = true
					result.loc = [...customeResult.loc]
				} else {
					result.rawTarget = this.matchFunc
					result.loc = iter.getUnmatchedLoc()
					result.fallMatcher = this
				}
			} else {
				throw new TSICompileError("empty matcher content is invalid.")
			}

			return result
		}
	}
}
