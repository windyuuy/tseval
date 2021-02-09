
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
		 * 消耗单位数(和捕获内容长度不同)
		 */
		get consume(): number {
			return this.loc[1] - this.loc[0]
		}
		/**
		 * 定位
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
		 * 失败的匹配器
		 */
		fallMatcher: IMatcher = null

		/**
		 * 子结果树
		 */
		// subResults: MatchedWord[]

		/**
		 * 实际匹配出的结果
		 */
		// matchedText: string = null

		/**
		 * 捕获内容
		 */
		get text(): string {
			return this.source.slice(this.loc[0], this.loc[1])
		}

		constructor(iter: IterContext) {
			this.init(iter)
		}

		init(iter: IterContext) {
			this.loc = [iter.cursor, iter.cursor]
			this.source = iter.source
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

	}

}