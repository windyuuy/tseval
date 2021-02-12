
namespace runtime {
	export type TSessionID = number;

	/**
	 * 存储静态会话信息
	 */
	export class SessionWaver {
		/**
		 * 不可变变量
		 */
		immultables: { [key: string]: VarID } = fsync.EmptyTable()

		/**
		 * 局部变量
		 */
		locals: { [key: string]: VarID } = fsync.EmptyTable()
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

		/**
		 * 运行时构建错误列表
		 */
		protected runtimeWaverErrors: RuntimeWaverError[] = []
		/**
		 * 标记不可变量声明会话
		 */
		protected immultableBorder: boolean = false

		init() {
			this.sessions = Object.create(null)
			this.sessionIdAcc = 1
			this.sessionStack.length = 0
			this.runtimeWaverErrors.length = 0
			this.immultableBorder = false
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
		 * 标记不可变变量
		 * @param a 
		 */
		declareImmultableLocalVar(a: VarID) {
			a.isUnmultable = true
			// let ses = this.activeSession
			// ses.immultables[a.name] = a
			this.immultableBorder = true
		}

		/**
		 * 声明局部变量
		 * @param a 
		 */
		declareLocalVar(a: VarID) {
			let ses = this.activeSession
			if (ses.locals[a.name]) {
				let error = new DuplicatedSymbolDeclaration().init(a)
				this.pushError(error)
			}

			let localId = this.genLocalId()
			a.id = localId
			a.sessionStackIndex = 0
			a.isValueAssigned = false
			ses.locals[a.name] = a

			// 确定变量是否可变
			a.isUnmultable = this.immultableBorder

			this.immultableBorder = false
		}

		/**
		 * 添加构建运行时错误
		 * @param error 
		 */
		pushError<T extends RuntimeWaverError>(error: T | (new () => T)): void {
			if (error instanceof MyError) {
				this.runtimeWaverErrors.push(error)
			} else {
				this.runtimeWaverErrors.push(new error())
			}
		}

		/**
		 * 获取构建运行时错误
		 */
		getTopError() {
			return this.runtimeWaverErrors[0]
		}

		/**
		 * 复制运行时构建状态
		 */
		clone() {
			let runtimeWaver = new RuntimeWaver()
			runtimeWaver.runtimeWaverErrors = this.runtimeWaverErrors.concat()
			return runtimeWaver
		}

		/**
		 * 标记变量已赋值
		 * @param rawA 缓存在会话中的变量
		 * @param a 外部引用的变量
		 */
		assignLocalVar(rawA: VarID, a: VarID) {
			if (rawA.isValueAssigned && rawA.isUnmultable) {
				// 值不可变则无法赋值
				let error = new AssignImmutableError().init(rawA)
				this.pushError(error)
			}

			rawA.isValueAssigned = true
			a.isValueAssigned = true
		}

		/**
		 * 根据a中的变量名索引变量所在栈信息和id信息
		 * @param a 
		 * @return raw info in session
		 */
		seekLocalVar(a: VarID): VarID {
			for (let i = 0; i < this.sessionStack.length; i++) {
				let ses = this.sessionStack[i]
				// let ses = this.sessions[sesid]
				if (ses.locals[a.name]) {
					let info = ses.locals[a.name]
					a.id = info.id
					a.sessionStackIndex = i
					a.isUnmultable = info.isUnmultable
					a.isValueAssigned = info.isValueAssigned
					return info
				}
			}

			// TODO:可能需要检查局部变量未声明问题
			// throw new TSICompileError(`undefined local var : ${a.name}`)
		}
	}
}
