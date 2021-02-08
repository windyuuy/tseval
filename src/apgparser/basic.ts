
namespace pgparser {
	export type Number2 = [number, number]
	export type Literals = string

	/**
	 * 自定义匹配函数
	 */
	export type MatcherFunc = (iter: IterContext) => MatchedResult
	/**
	 * 文法基础匹配元素
	 */
	export type MatcherStatement = string | RegExp | MatcherFunc

	/**
	 * 匹配成功信号
	 */
	export type MatchedSignal = (p: MatchedResult) => void

	/**
	 * 返回默认匹配失败结果
	 * @param iter 
	 */
	export function FailedMatchResult(iter: IterContext): MatchedResult {
		return new MatchedResult(iter)
	}
}