
namespace pgparser {
	export type Number2 = [number, number]
	export type Number3 = [number, number, number]
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
	export type MatchedSignalPulse = (p: MatchedResult) => void

	/**
	 * 匹配成功信号
	 */
	export class MatchedSignal {
		/**
		 * 信号
		 */
		pulse: MatchedSignalPulse
		/**
		 * 携带数据
		 */
		p1: MatchedResult
	}

	/**
	 * 返回默认匹配失败结果
	 * @param iter 
	 */
	export function FailedMatchResult(iter: IterContext, result?: MatchedResult, matcher?: IMatcher): MatchedResult {
		let upResult = new MatchedResult(iter)
		if (result) {
			upResult.mergeFailure(result)
		}
		if (matcher) {
			upResult.fallMatcher = matcher
		}
		upResult.loc[0] = result.loc[0]
		upResult.loc[1] = result.loc[1]
		return upResult
	}
}