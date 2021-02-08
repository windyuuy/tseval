
namespace runtime {
	/**
	 * 即时指令构建
	 */
	export class RuntimeCoder {
		/**
		 * 依赖的上下文编织器
		 */
		runtimeWaver: RuntimeWaver;

		/**
		 * 进入新会话
		 */
		pushSession() {
			return this.runtimeWaver.pushSession()
		}

		/**
		 * 离开当前会话
		 */
		popSession() {
			return this.runtimeWaver.popSession()
		}

		/**
		 * 导入局部常量
		 * @param a 
		 * @param value 
		 */
		pushConst(a: VarID, value: any): JITInstruction {
			return [function (session: RuntimeSession) {
				session.push(value)
			}, "const", a, value]
		}

		/**
		 * 导出变量
		 */
		exportVar(a: VarID): JITInstruction {
			return [function (session: RuntimeSession) {
				let value = session.getVar(a)
				session.setExport(a, value)
			}, "exportvar", a]
		}

		add(a: VarID, b: VarID): JITInstruction {
			return [function (session: RuntimeSession) {
				let va = session.pop()
				let vb = session.pop()
				return va + vb
			}, "+", a, b]
		}

		sub(a: VarID, b: VarID): JITInstruction {
			return [function (session: RuntimeSession) {
				let va = session.pop()
				let vb = session.pop()
				return va - vb
			}, "-", a, b]
		}

		mult(a: VarID, b: VarID): JITInstruction {
			return [function (session: RuntimeSession) {
				let va = session.pop()
				let vb = session.pop()
				return va * vb
			}, "*", a, b]
		}

		div(a: VarID, b: VarID): JITInstruction {
			return [function (session: RuntimeSession) {
				let va = session.pop()
				let vb = session.pop()
				return va / vb
			}, "/", a, b]
		}

	}
}
