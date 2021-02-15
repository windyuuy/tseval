
namespace pgparser {

	/**
	 * 匹配结果
	 */
	export class MatchedResult {
		/**
		 * 源内容
		 */
		source: Literals
		/**
		 * 定位
		 * - [0]: 捕获内容起首
		 * - [1]: 捕获内容末位
		 */
		loc: Number2

		/**
		 * 是否匹配成功
		 */
		isMatched: boolean = false

		/**
		 * 匹配次数
		 */
		times: number = 1

		/**
		 * 原因
		 */
		reason: string = ""

		/**
		 * 原始匹配目标
		 */
		rawTarget: any

		/**
		 * 匹配器
		 */
		matcher: IMatcher = null

		/**
		 * 失败的匹配器
		 */
		fallMatcher: IMatcher = null

		/**
		 * 匹配子列表
		 * - 仅调试用, 支持查看匹配明细
		 */
		subResults: MatchedResult[] = []

		/**
		 * 子结果树
		 */
		// subResults: MatchedWord[]

		/**
		 * 实际匹配出的结果
		 */
		// matchedText: string = null

		/**
		 * 获取附近的文本, 用于查看错误信息
		 */
		getSurroundTexts() {
			return [
				this.source.slice(this.loc[0] - 10, this.loc[0]),
				this.source.slice(this.loc[0], this.loc[1]),
				this.source.slice(this.loc[1], this.loc[1] + 10),
			]
		}

		/**
		 * 捕获内容
		 */
		get text(): string {
			return this.source.slice(this.loc[0], this.loc[1])
		}

		/**
		 * 剩余内容
		 */
		get leftText() {
			return this.source.slice(this.loc[1])
		}

		/**
		 * 消耗单位数(和捕获内容长度不同)
		 */
		get consumeLen(): number {
			return this.loc[1] - this.loc[0]
		}

		/**
		 * 捕获长度
		 */
		get matchedLength(): number {
			return this.loc[1] - this.loc[0]
		}

		constructor(iter: IterContext, matcher: IMatcher) {
			this.init(iter, matcher)
		}

		init(iter: IterContext, matcher: IMatcher) {
			this.loc = [iter.cursor, iter.cursor]
			this.source = iter.source
			this.matcher = matcher
			return this
		}

		/**
		 * 合并失败信息
		 * @param source 
		 */
		mergeFailure(source: MatchedResult) {
			this.reason = source.reason
			this.rawTarget = source.rawTarget
			this.fallMatcher = source.fallMatcher
		}

		/**
		 * 添加子结果
		 * - 供调试观测用
		 * @param result 
		 */
		addSubResult(result: MatchedResult) {
			this.subResults.push(result)
		}

	}

}