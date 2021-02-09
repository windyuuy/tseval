
namespace runtime {
	let SNone = Symbol("None")

	/**
	 * 即时指令构建
	 */
	export class RuntimeCoder {
		/**
		 * 依赖的上下文编织器
		 */
		protected runtimeWaver: RuntimeWaver;

		init(runtimeWaver: RuntimeWaver) {
			this.runtimeWaver = runtimeWaver
		}

		/**
		 * 进入新会话
		 */
		pushSession(): JITInstruction {
			this.runtimeWaver.pushSession()
			return [function (thread: RuntimeThread) {
				thread.pushSession()
			}, "pushsession"]
		}

		/**
		 * 离开当前会话
		 */
		popSession(): JITInstruction {
			this.runtimeWaver.popSession()
			return [function (thread: RuntimeThread) {
				thread.popSession()
			}, "popsession"]
		}

		/**
		 * 导入局部常量
		 * @param a?
		 * @param value 
		 */
		pushConst(a: VarID, value: TVarValue): JITInstruction {
			return [function (thread: RuntimeThread) {
				thread.push(value)
			}, "useconst", a, value]
		}

		// TODO:优化变量声明效率
		/**
		 * 声明局部变量
		 * @param a 
		 */
		declareLocalVar(a: VarID, v: TVarValue = SNone): JITInstruction {
			this.runtimeWaver.declareLocalVar(a)
			return [function (thread: RuntimeThread) {
				thread.setLocalVar(a, undefined)
			}, "let", a, v]
		}

		/**
		 * 检查是否获取到了有效的局部变量信息
		 * @param a 
		 */
		protected checkLocalVar(a: VarID): void {
			if (a.id == null) {
				throw new Error("invalid local var may undefined.")
			}
		}

		/**
		 * 使用栈顶数据设置局部变量值
		 * @param a 
		 * @param v 
		 */
		assignLocalVar(a: VarID, v: VarID): JITInstruction {
			this.runtimeWaver.seekLocalVar(a)
			this.checkLocalVar(a)
			return [function (thread: RuntimeThread) {
				let value = thread.pop()
				thread.setLocalVar(a, value)
			}, "setlocal", a, v]
		}

		/**
		 * 获取局部变量值并置于栈顶
		 * @param a 
		 */
		getLocalVar(a: VarID): JITInstruction {
			this.runtimeWaver.seekLocalVar(a)
			this.checkLocalVar(a)
			return [function (thread: RuntimeThread) {
				let value = thread.getLocalVar(a)
				thread.push(value)
			}, "getLocal", a]
		}

		/**
		 * 索引变量成员
		 * @param a 
		 */
		indexVarMember(a: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let value = thread.pop()
				let memberValue = value[a.name]
				thread.push(memberValue)
			}, "index"]
		}

		/**
		 * 导出变量
		 */
		exportVar(a: VarID): JITInstruction {
			// TODO: 转值导出为命名导出
			this.runtimeWaver.declareLocalVar(a)
			return [function (thread: RuntimeThread) {
				let value = thread.pop()
				thread.setExport(a, value)
			}, "exportvar", a]
		}

		//#region 数学运算符
		add(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va + vb
				thread.push(vc)
			}, "+", a, b]
		}

		sub(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va - vb
				thread.push(vc)
			}, "-", a, b]
		}

		mult(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va * vb
				thread.push(vc)
			}, "*", a, b]
		}

		div(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va / vb
				thread.push(vc)
			}, "/", a, b]
		}
		//#endregion

	}
}
