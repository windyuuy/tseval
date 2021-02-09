
namespace runtime {
	export type LocalVarId = number
	/**
	 * 运行时动态会话
	 */
	export class RuntimeSession {
		/**
		 * 局部变量
		 * - 局部变量全部以ID存储
		 */
		locals: { [key: number]: any } = Object.create(null)

		/**
		 * 设置局部变量值
		 * @param key 
		 * @param value 
		 */
		setLocalVar(key: VarID, value: any): void {
			this.locals[key.id] = value
		}

		/**
		 * 获取局部变量值
		 * @param key 
		 */
		getLocalVar(key: VarID): any {
			let value = this.locals[key.id]
			return value
		}

	}
}
