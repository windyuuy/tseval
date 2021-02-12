
namespace runtime {
	let SNone = Symbol("None")

	const SESSION_LOCALS = { SESSION_LOCALS: "SESSION_LOCALS" }
	const SESSION_ENV_LOCALS = { SESSION_ENV_LOCALS: "SESSION_ENV_LOCALS" }

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
				thread.push(undefined)
				thread.push(SESSION_LOCALS)
			}, "declarelocalvar", a, v]
		}

		/**
		 * 标记不可变局部变量
		 * @param a 
		 */
		declareImmultableLocalVar(a: VarID): JITInstruction {
			this.runtimeWaver.declareImmultableLocalVar(a)
			return [function (thread: RuntimeThread) {
			}, "immultable", a]
		}

		/**
		 * 检查是否获取到了有效的局部变量信息
		 * @param a 
		 */
		protected checkLocalVar(a: VarID): void {
			if (!this.isValidVarID(a)) {
				let error = new runtime.InvalidLocalVarError().init(a)
				this.runtimeWaver.pushError(error)
			}
		}

		/**
		 * 检查是否有效局部变量信息
		 * @param a 
		 */
		isValidVarID(a: VarID): boolean {
			return a.id != null
		}

		/**
		 * 使用栈顶数据设置局部变量值
		 * @param a 
		 * @param v 
		 */
		assignLocalVar(a: VarID, v: VarID): JITInstruction {
			let rawA = this.runtimeWaver.seekLocalVar(a)
			this.checkLocalVar(a)
			this.runtimeWaver.assignLocalVar(rawA, a)
			return [function (thread: RuntimeThread) {
				// 索引上下文出栈
				let context = thread.pop()
				// 弹出之前引用变量时自动入栈的变量值
				thread.pop()

				let value = thread.pop()
				if (context == SESSION_LOCALS) {
					// 如果是局部变量赋值
					thread.setLocalVar(a, value)
				} else if (context == SESSION_ENV_LOCALS) {
					// 如果是环境变量赋值
					throw new Error("env local is immutable")
				} else {
					// 如果是成员变量赋值
					context[a.name] = value
				}
			}, "setlocal", a, v]
		}

		/**
		 * 获取局部变量值并置于栈顶
		 * @param a 
		 */
		getLocalVar(a: VarID): JITInstruction {
			this.runtimeWaver.seekLocalVar(a)
			if (this.isValidVarID(a)) {
				return [function (thread: RuntimeThread) {
					let value = thread.getLocalVar(a)
					// 值压栈
					thread.push(value)
					// 索引对象压栈
					thread.push(SESSION_LOCALS)
				}, "getLocal", a]
			} else {
				this.runtimeWaver.seekEnvVar(a)
				this.checkLocalVar(a)
				return [function (thread: RuntimeThread) {
					let value = thread.getLocalEnvVar(a)
					// 值压栈
					thread.push(value)
					// 索引对象压栈
					thread.push(SESSION_ENV_LOCALS)
				}, "getLocal", a]
			}
		}

		/**
		 * 索引变量成员
		 * @param a 
		 */
		indexVarMember(a: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				/**成员索引目标 */
				thread.pop()
				// 索引值出栈
				let value = thread.pop()
				let memberValue = value[a.name]
				thread.push(memberValue)
				// 索引对象压栈
				thread.push(value)
			}, "index"]
		}

		/**
		 * 变量作为值引用
		 */
		referVarAsValue(a: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				thread.pop()
			}, "referasvalue"]
		}

		/**
		 * 声明局部变量并标记为导出
		 */
		exportWithDeclareVar(a: VarID): JITInstruction {
			// TODO: 转值导出为命名导出
			this.runtimeWaver.declareLocalVar(a)
			return [function (thread: RuntimeThread) {
				let value = thread.pop()
				thread.setExport(a, value)
			}, "exportvar", a]
		}

		/**
		 * 声明局部变量并标记为导出
		 */
		exportVar(a: VarID): JITInstruction {
			// TODO: 转值导出为命名导出
			this.runtimeWaver.seekLocalVar(a)
			this.checkLocalVar(a)
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

		mod(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va % vb
				thread.push(vc)
			}, "%", a, b]
		}

		pow(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va ** vb
				thread.push(vc)
			}, "**", a, b]
		}

		equal(p1: VarID, p2: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va == vb
				thread.push(vc)
			}, "", p1, p2]
		}
		notEqual(p1: VarID, p2: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va != vb
				thread.push(vc)
			}, "", p1, p2]
		}
		strictEqual(p1: VarID, p2: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va === vb
				thread.push(vc)
			}, "", p1, p2]
		}
		strictNotEqual(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va !== vb
				thread.push(vc)
			}, "", a, b]
		}

		//#endregion

	}
}
