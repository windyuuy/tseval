
namespace runtime {
	export type TSessionID = number;

	/**
	 * 存储静态会话信息
	 */
	export class SessionWaver {

	}

	/**
	 * 运行时执行上下文编织器
	 */
	export class RuntimeWaver {
		/**
		 * 会话存储坏境
		 */
		sessions: { [key: string]: SessionWaver } = Object.create(null);
		/**
		 * 当前上下文会话id累加器
		 */
		sessionIdAcc: number = 1

		/**
		 * 会话栈
		 * - 代表会话父子关系
		 * - 栈顶为当前会话
		 */
		sessionStack: SessionWaver[] = []

		/**
		 * 局部变量ID累加器
		 */
		protected localIdAcc: number = 1

		init() {
			this.sessions = Object.create(null)
			this.sessionIdAcc = 1
			this.sessionStack.length = 0
			this.localIdAcc = 1
		}

		/**
		 * 生成局部变量运行时全局唯一ID
		 */
		genLocalId() {
			return this.localIdAcc++
		}

		get activeSession() {
			return this.sessionStack[0]
		}

		/**
		 * 进入新会话
		 */
		pushSession(): void {
			let sesid = this.sessionIdAcc++
			let ses = this.sessions[sesid] = new SessionWaver()
			this.sessionStack.unshift(ses)
		}
		/**
		 * 离开会话
		 */
		popSession(): void {
			this.sessionStack.shift()
		}

		/**
		 * 声明局部变量
		 * @param a 
		 */
		declareLocalVar(a: VarID) {
			let localId = this.genLocalId()
			a.id = localId
			this.activeSession[a.name] = a
		}

		/**
		 * 根据a中的变量名索引变量所在栈信息和id信息
		 * @param a 
		 */
		seekLocalVar(a: VarID) {
			for (let i = 0; i < this.sessionStack.length; i++) {
				let ses = this.sessionStack[i]
				// let ses = this.sessions[sesid]
				if (ses[a.name]) {
					let info = ses[a.name]
					a.id = info.id
					a.sessionStackIndex = i
					break
				}
			}

			// TODO:可能需要检查局部变量未声明问题
			// throw new TSICompileError(`undefined local var : ${a.name}`)
		}
	}
}
