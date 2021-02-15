
namespace runtime {
	export let SNone = Symbol("None")

	export const SESSION_LOCALS = { SESSION_LOCALS: "SESSION_LOCALS" }
	export const SESSION_ENV_LOCALS = { SESSION_ENV_LOCALS: "SESSION_ENV_LOCALS" }
	export const SESSION_INVALID_LEFTHAND_VAR = { SESSION_INVALID_RIGHTHAND_VAR: "SESSION_INVALID_RIGHTHAND_VAR" }
	export function GetInvalidLeftHandSideVar(pa: VarID, a: VarID): VarID {
		return {
			name: `${pa.name}?.${a.name}`,
			indexSource: SESSION_INVALID_LEFTHAND_VAR,
		}
	}

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
		 * 捕获行注释
		 * @param p 
		 */
		captureLineComment(a: VarID) {
			this.runtimeWaver.captureLineComment(a)
		}

		/**
		 * 捕获块注释
		 * @param p 
		 */
		captureBlockComment(a: VarID) {
			this.runtimeWaver.captureLineComment(a)
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
		 * 调用函数
		 * @param a 
		 */
		callFunction(a: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				// 索引值出栈
				let func = thread.pop()
				let value = func()
				thread.push(value)
			}, "callfunc"]
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
				thread.push(a)
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
			// 检查左值赋值引用
			if (this.runtimeWaver.isRightHandValue) {
				this.runtimeWaver.pushError(new runtime.InvalidLeftHandAssignmentError().init(a))
			}
			if (this.runtimeWaver.isGoonIndexMember) {
				this.runtimeWaver.isGoonIndexMember = false
				return [function (thread: RuntimeThread) {
					// 索引上下文出栈
					let address = thread.pop() as VarID
					let context = address.indexSource
					// 弹出之前引用变量时自动入栈的变量值
					thread.pop()

					let value = thread.pop()
					if (context == SESSION_LOCALS) {
						// 如果是局部变量赋值
						throw new Error("invalid member host")
					} else if (context == SESSION_ENV_LOCALS) {
						// 如果是环境变量赋值
						throw new Error("invalid member host")
					} else if (context == SESSION_INVALID_LEFTHAND_VAR) {
						// 无效左值引用
						throw new Error(`invalid left-hand side in assignment: <${address.name}>`)
					} else {
						// 如果是成员变量赋值
						context[address.name] = value
					}
				}, "setmember", a, v]
			} else {
				let rawA = this.runtimeWaver.seekLocalVar(a)
				this.checkLocalVar(a)
				this.runtimeWaver.assignLocalVar(rawA, a)
				return [function (thread: RuntimeThread) {
					// 索引上下文出栈
					let address = thread.pop() as VarID
					let context = address.indexSource
					// 弹出之前引用变量时自动入栈的变量值
					thread.pop()

					let value = thread.pop()
					if (context == SESSION_LOCALS) {
						// 如果是局部变量赋值
						thread.setLocalVar(a, value)
					} else if (context == SESSION_ENV_LOCALS) {
						// 如果是环境变量赋值
						throw new Error("env local is immutable")
					} else if (context == SESSION_INVALID_LEFTHAND_VAR) {
						// 无效左值引用
						throw new Error(`invalid left-hand side in assignment: <${address.name}>`)
					} else {
						// 如果是成员变量赋值
						context[a.name] = value
					}
				}, "setlocal", a, v]
			}
		}

		/**
		 * 获取局部变量值并置于栈顶
		 * @param a 
		 */
		getLocalVar(a: VarID): JITInstruction {
			this.runtimeWaver.isGoonIndexMember = false
			this.runtimeWaver.isRightHandValue = false
			this.runtimeWaver.seekLocalVar(a)
			if (this.isValidVarID(a)) {
				return [function (thread: RuntimeThread) {
					let value = thread.getLocalVar(a)
					// 值压栈
					thread.push(value)
					// 索引对象压栈
					thread.push(a)
				}, "getLocal", a]
			} else {
				this.runtimeWaver.seekEnvVar(a)
				this.checkLocalVar(a)
				return [function (thread: RuntimeThread) {
					let value = thread.getLocalEnvVar(a)
					// 值压栈
					thread.push(value)
					// 索引对象压栈
					thread.push(a)
				}, "getLocal", a]
			}
		}

		/**
		 * 索引变量成员
		 * @param a 
		 */
		indexVarMember(a: VarID): JITInstruction {
			this.runtimeWaver.isGoonIndexMember = true
			this.runtimeWaver.isRightHandValue = false
			return [function (thread: RuntimeThread) {
				/**成员索引目标 */
				thread.pop()
				// 索引值出栈
				let value = thread.pop()
				let memberValue = value[a.name]
				thread.push(memberValue)
				a.indexSource = value
				// 索引对象压栈
				thread.push(a)
			}, "index"]
		}

		/**
		 * 可选链
		 * @param a 
		 */
		optionalChaining(a: VarID): JITInstruction {
			this.runtimeWaver.isGoonIndexMember = true
			this.runtimeWaver.isRightHandValue = true
			return [function (thread: RuntimeThread) {
				/**成员索引目标 */
				let ca = thread.pop()
				let invalidLeftHandVar = GetInvalidLeftHandSideVar(ca, a)
				// 索引值出栈
				let value = thread.pop()
				if (value == null) {
					// 母值为null or undefined, 那么返回 undefined
					thread.push(undefined)
				} else {
					let memberValue = value[a.name]
					thread.push(memberValue)
				}
				// 索引对象压栈
				thread.push(invalidLeftHandVar)
			}, "index"]
		}

		/**
		 * 变量作为值引用
		 */
		referVarAsValue(a: VarID): JITInstruction {
			this.runtimeWaver.isGoonIndexMember = false
			this.runtimeWaver.isRightHandValue = true
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
			}, "exportnewvar", a]
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
				// let vc = va ** vb
				let vc = vb ** va
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
		opBitwiseLeftShift(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va << vb
				thread.push(vc)
			}, "", a, b]
		}
		opBitwiseRightShift(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va >> vb
				thread.push(vc)
			}, "", a, b]
		}
		opBitwiseUnsignedRightShift(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va >>> vb
				thread.push(vc)
			}, "", a, b]
		}
		opLessThan(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va < vb
				thread.push(vc)
			}, "", a, b]
		}
		opLessThanOrEqual(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va <= vb
				thread.push(vc)
			}, "", a, b]
		}
		opGreaterThan(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va > vb
				thread.push(vc)
			}, "", a, b]
		}
		opGreaterThanOrEqual(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va >= vb
				thread.push(vc)
			}, "", a, b]
		}
		opIn(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = (va in vb)
				thread.push(vc)
			}, "", a, b]
		}
		opInstanceof(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = (va instanceof vb)
				thread.push(vc)
			}, "", a, b]
		}
		opBitwiseAND(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va & vb
				thread.push(vc)
			}, "", a, b]
		}
		opBitwiseXOR(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va ^ vb
				thread.push(vc)
			}, "", a, b]
		}
		opBitwiseOR(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va | vb
				thread.push(vc)
			}, "", a, b]
		}
		opLogicalAND(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va && vb
				thread.push(vc)
			}, "", a, b]
		}
		opLogicalOR(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va || vb
				thread.push(vc)
			}, "", a, b]
		}
		opNullishCoalescingOperator(a: VarID, b: VarID): JITInstruction {
			return [function (thread: RuntimeThread) {
				let vb = thread.pop()
				let va = thread.pop()
				let vc = va ?? vb
				thread.push(vc)
			}, "", a, b]
		}

		//#endregion

	}
}
