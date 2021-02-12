
namespace runtime {
	export type TVarValue = any
	/**
	 * 变量ID信息
	 */
	export class VarID {
		/**
		 * 预声明的静态局部ID
		 */
		id?: LocalVarId

		/**
		 * 父会话栈偏移
		 * - 往往需要自动寻址分析获取
		 */
		sessionStackIndex?: number

		/**
		 * 命名信息
		 */
		name?: string

		/**
		 * 供调试用的表达式信息
		 */
		expression?: string

		/**
		 * 供调试用的常量值信息
		 */
		constValue?: TVarValue

		/**
		 * 值是否已赋值
		 */
		isValueAssigned?: boolean

		/**
		 * 是否赋值后不可变
		 */
		isImmultable?: boolean

		/**
		 * 寄宿的索引源
		 */
		indexSource?: Object
	}

	/**
	 * 复制变量定义信息
	 * @param a 
	 * @param info 
	 */
	export function copyVarIDInfo(a: VarID, info: VarID) {
		a.id = info.id
		a.isImmultable = info.isImmultable
		a.isValueAssigned = info.isValueAssigned
		a.indexSource = info.indexSource
	}

	/**
	 * 即时执行指令
	 */
	export type JITInstruction = [(session: RuntimeThread) => void, string, any?, any?]

	/**
	 * 运行时线程
	 */
	export class RuntimeThread {

		/**
		 * 运行时会话唯一ID累加器
		 */
		sessionIdAcc: number = 1
		/**
		 * 创建新会话并设为当前活动会话(加入栈顶)
		 */
		pushSession() {
			let sessionId = this.sessionIdAcc++
			let newSession = new RuntimeSession()
			this.sessions[sessionId] = newSession
			this.sessionStack.unshift(newSession)
		}
		/**
		 * 离开当前活动会话
		 */
		popSession() {
			this.sessionStack.shift()
		}

		/**
		 * 当前活动会话
		 */
		get activeSession() {
			return this.sessionStack[0]
		}

		/**
		 * 所有活动会话列表
		 */
		sessions: { [key: number]: RuntimeSession } = Object.create(null);

		/**
		 * 会话栈
		 */
		sessionStack: RuntimeSession[] = []

		/**
		 * 运行时共享栈
		 */
		stack: TVarValue[] = []

		/**
		 * 弹出栈中的值
		 */
		pop(): TVarValue {
			let value = this.stack.pop()
			return value
		}

		/**
		 * 压入栈值
		 * @param value 
		 */
		push(value: TVarValue): void {
			this.stack.push(value)
		}

		/**
		 * 设置局部变量值
		 * @param key 
		 * @param value 
		 */
		setLocalVar(key: VarID, value: TVarValue): void {
			let ses = this.sessionStack[key.sessionStackIndex]
			ses.setLocalVar(key, value)
		}

		/**
		 * 获取局部变量值
		 * @param key hpqu
		 */
		getLocalVar(key: VarID): TVarValue {
			let ses = this.sessionStack[key.sessionStackIndex]
			return ses.getLocalVar(key)
		}

		/**
		 * 导出变量
		 */
		exports: { [key: string]: TVarValue } = Object.create(null)
		/**
		 * 标记导出变量名称
		 * @param key 
		 * @param value 
		 */
		setExport(key: VarID, value: TVarValue) {
			this.exports[key.name] = value
		}

		/**
		 * 获取导出变量列表
		 */
		getExports(): Object {
			let exps = Object.create(null)
			for (let key in this.exports) {
				exps[key] = this.exports[key]
			}
			return exps
		}

		protected localEnvSession: RuntimeSession = new RuntimeSession()
		/**
		 * 导入环境变量
		 * @param sessionWaver 
		 * @param env 
		 */
		importLocalEnv(sessionWaver: SessionWaver, env: Object) {
			let ses = this.localEnvSession
			for (let key of Object.keys(sessionWaver.locals)) {
				let a = sessionWaver.locals[key]
				ses.setLocalVar(a, env[key])
			}
		}
		/**
		 * 获取环境变量值
		 * @param key 
		 */
		getLocalEnvVar(key: VarID): TVarValue {
			let value = this.localEnvSession.getLocalVar(key)
			return value
		}
	}
}
