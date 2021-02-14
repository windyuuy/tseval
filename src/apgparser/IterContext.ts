
namespace pgparser {
	export class IterContext {
		/**
		 * 源内容
		 */
		source: Literals = ""

		/**
		 * 当前游标所在位置
		 */
		cursor: number = 0

		init(source: Literals) {
			this.cursor = 0
			this.source = source
			return this
		}

		clone() {
			let context = new IterContext()
			context.source = this.source
			context.cursor = this.cursor
			return context
		}

		merge(other: IterContext) {
			if (this.source != other.source) {
				throw new TSICompileError("unmatched source.")
			}
			this.cursor = other.cursor
		}

		/**
		 * 通过对比差异获取定位
		 * @param other 
		 */
		getLocByDiff(other: IterContext): Number2 {
			return [this.cursor, other.cursor]
		}

		/**
		 * 前进对应步数
		 * @param count 
		 */
		forward(count: number) {
			this.cursor += count;
		}

		/**
		 * 按照当前位置裁切
		 * @param len 
		 * @param offset 
		 */
		slice(len: number, offset: number = 0) {
			let start = this.cursor + offset
			return this.source.slice(start, start + len)
		}

		/**
		 * 截取剩余文本
		 */
		get leftText() {
			return this.source.slice(this.cursor)
		}

		/**
		 * 获取文本所在定位
		 * @param str 
		 */
		getLoc(str: string): Number2 {
			return [this.cursor, this.cursor + str.length]
		}

		getUnmatchedLoc(): Number2 {
			return [this.cursor, this.cursor]
		}

		/**
		 * 匹配会话中缓存的匹配信号
		 */
		matchedSignals: MatchedSignal[] = []

		resortSignalsByOrder(subSignalsRecords: number[]) {
			// 反转信号序号
			let subSignals: MatchedSignal[] = []
			for (let i = subSignalsRecords.length - 1; i >= 1; i--) {
				let r0 = subSignalsRecords[i - 1]
				let r1 = subSignalsRecords[i]
				let subSlice = this.matchedSignals.slice(r0, r1)
				subSignals.push(...subSlice)
			}
			this.matchedSignals.length = 0
			this.matchedSignals.push(...subSignals)
		}

		/**
		 * 添加信号
		 * @param pulse 
		 */
		pushSignal(pulse: MatchedSignalPulse, result: MatchedResult) {
			this.matchedSignals.push({
				pulse,
				p1: result,
			})
		}

		/**
		 * 合并模拟匹配中挂靠的信号
		 * - 针对一对多的模拟情形, 需要创建上下文副本
		 * @param iter 
		 */
		mergeSimulated(iter: IterContext) {
			this.matchedSignals.push(...iter.matchedSignals)
		}

		/**
		 * 遍历应用匹配信号
		 */
		applySignals() {
			for (let signal of this.matchedSignals) {
				let pulse = signal.pulse
				pulse(signal.p1)
			}
		}

	}
}