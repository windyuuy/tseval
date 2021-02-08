
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
				throw new Error("unmatched source.")
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

	}
}