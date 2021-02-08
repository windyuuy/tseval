
namespace runtime {
	export type TSessionID = number;
	/**
	 * 运行时执行上下文编织器
	 */
	export class RuntimeWaver {

		/**
		 * 会话存储坏境
		 */
		sessions: Object = Object.create(null);
		/**
		 * 当前上下文会话id累加器
		 */
		sessionIdAcc: number = 1

		/**
		 * 会话栈
		 * - 栈顶为当前会话id
		 */
		sessionStack: TSessionID[] = []

		/**
		 * 进入新会话
		 */
		pushSession(): TSessionID {
			let sesid = this.sessionIdAcc++
			this.sessionStack.push(sesid)
			return sesid
		}
		/**
		 * 离开会话
		 */
		popSession(): TSessionID {
			this.sessionStack.pop()
			let sesid = this.sessionStack[this.sessionStack.length - 1]
			return sesid
		}

	}
}
