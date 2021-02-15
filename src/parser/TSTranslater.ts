
namespace tseval {
	/**
	 * 转移文法
	 */
	export class TSTranslater {
		protected instructions = new runtime.RuntimeInstructions()
		protected runtimeCoder = new runtime.RuntimeCoder()
		protected runtimeWaver = new runtime.RuntimeWaver()

		init() {
			this.instructions.init()
			this.runtimeWaver.init()
			this.runtimeCoder.init(this.runtimeWaver)
			return this
		}

		clear() {
			this.init()
		}

		/**
		 * 复制执行指令
		 */
		cloneInstructions() {
			return this.instructions.clone()
		}

		/**
		 * 复制运时构建状态
		 */
		cloneRuntimeWaver() {
			return this.runtimeWaver.clone()
		}

		/**
		 * 导入局部环境
		 * @param env 
		 */
		importLocalEnv(env: Object) {
			this.runtimeWaver.importLocalEnv(env)
		}

		/**
		 * 获取变量调试信息
		 * @param p 
		 * @param index 
		 */
		protected getVar(p: pgparser.MatchedResult, index: number): runtime.VarID {
			return {
			}
		}

		/**
		 * 捕获行注释
		 * @param p 
		 */
		captureLineComment(p: pgparser.MatchedResult) {
			this.runtimeCoder.captureLineComment({
				expression: p.text,
			})
		}

		/**
		 * 捕获块注释
		 * @param p 
		 */
		captureBlockComment(p: pgparser.MatchedResult) {
			this.runtimeCoder.captureLineComment({
				expression: p.text,
			})
		}

		/**
		 * 进入新会话边界
		 * @param p 
		 */
		enterSession(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.pushSession()
			this.instructions.push(inst)
		}

		/**
		 * 离开会话边界
		 * @param p 
		 */
		leaveSession(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.popSession()
			this.instructions.push(inst)
		}

		/**
		 * 调用函数
		 * @param p 
		 */
		callFunction(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.callFunction({
				name: "",
				constValue: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 导入常量
		 * @param p 
		 * @param value 
		 */
		pushConstNumber(p: pgparser.MatchedResult) {
			let constValue = parseFloat(p.text)
			let inst = this.runtimeCoder.pushConst({
				name: `const_${p.text}`,
				constValue: p.text,
			}, constValue)
			this.instructions.push(inst)
		}

		/**
		 * 导入常量
		 * @param p 
		 * @param value 
		 */
		pushConstString(p: pgparser.MatchedResult) {
			let constValue = JSON.parse(p.text)
			let inst = this.runtimeCoder.pushConst({
				name: `const_${p.text}`,
				constValue: p.text,
			}, constValue)
			this.instructions.push(inst)
		}

		/**
		 * 导入常量
		 * @param p 
		 * @param value 
		 */
		pushLongConstString(p: pgparser.MatchedResult) {
			let constValue = p.text
			constValue = constValue.replace(/\\'/g, "'")
			constValue = '"' + constValue.replace(/"/g, '\\"') + '"'
			constValue = JSON.parse(constValue)
			let inst = this.runtimeCoder.pushConst({
				name: `const_${p.text}`,
				constValue: p.text,
			}, constValue)
			this.instructions.push(inst)
		}

		/**
		 * 声明局部变量
		 * @param p 
		 */
		declareLocalVar(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.declareLocalVar({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 标记不可变局部变量
		 * @param a 
		 */
		declareImmultableLocalVar(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.declareImmultableLocalVar({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 引用局部变量值
		 * @param p 
		 */
		referLocalVar(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.getLocalVar({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 索引变量值
		 * @param p 
		 */
		indexVarMember(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.indexVarMember({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 索引变量值
		 * @param p 
		 */
		optionalChaining(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.optionalChaining({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 变量作为值引用
		 */
		referVarAsValue(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.referVarAsValue({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 为局部变量赋值
		 * @param p 
		 */
		assignLocalVar(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.assignLocalVar({
				name: p.text,
			}, this.getVar(p, 0))
			this.instructions.push(inst)
		}

		/**
		 * 声明并赋值
		 * @param p 
		 */
		declareAndAssignLocalVar(p: pgparser.MatchedResult) {
			this.declareLocalVar(p)
			this.assignLocalVar(p)
		}

		/**
		 * 标记导出同时声明的变量
		 * @param p 
		 */
		exportWithDeclareVar(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.exportWithDeclareVar({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 标记导出变量
		 * @param p 
		 */
		exportVar(p: pgparser.MatchedResult) {
			let inst = this.runtimeCoder.exportVar({
				name: p.text,
			})
			this.instructions.push(inst)
		}

		/**
		 * 转换数学运算操作符	
		 * @param p 
		 */
		convOperation(p: pgparser.MatchedResult) {
			let p1 = this.getVar(p, 0)
			let p2 = this.getVar(p, 1)
			switch (p.text) {
				case "+": {
					let inst = this.runtimeCoder.add(p1, p2)
					this.instructions.push(inst)
					break;
				}

				case "-": {
					let inst = this.runtimeCoder.sub(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "*": {
					let inst = this.runtimeCoder.mult(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "/": {
					let inst = this.runtimeCoder.div(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "%": {
					let inst = this.runtimeCoder.mod(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "**": {
					let inst = this.runtimeCoder.pow(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "==": {
					let inst = this.runtimeCoder.equal(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "!=": {
					let inst = this.runtimeCoder.notEqual(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "===": {
					let inst = this.runtimeCoder.strictEqual(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "!==": {
					let inst = this.runtimeCoder.strictNotEqual(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "<<": {
					let inst = this.runtimeCoder.opBitwiseLeftShift(p1, p2)
					this.instructions.push(inst)
					break
				}

				case ">>": {
					let inst = this.runtimeCoder.opBitwiseRightShift(p1, p2)
					this.instructions.push(inst)
					break
				}

				case ">>>": {
					let inst = this.runtimeCoder.opBitwiseUnsignedRightShift(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "<": {
					let inst = this.runtimeCoder.opLessThan(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "<=": {
					let inst = this.runtimeCoder.opLessThanOrEqual(p1, p2)
					this.instructions.push(inst)
					break
				}

				case ">": {
					let inst = this.runtimeCoder.opGreaterThan(p1, p2)
					this.instructions.push(inst)
					break
				}

				case ">=": {
					let inst = this.runtimeCoder.opGreaterThanOrEqual(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "in": {
					let inst = this.runtimeCoder.opIn(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "instanceof": {
					let inst = this.runtimeCoder.opInstanceof(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "&": {
					let inst = this.runtimeCoder.opBitwiseAND(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "^": {
					let inst = this.runtimeCoder.opBitwiseXOR(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "|": {
					let inst = this.runtimeCoder.opBitwiseOR(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "&&": {
					let inst = this.runtimeCoder.opLogicalAND(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "||": {
					let inst = this.runtimeCoder.opLogicalOR(p1, p2)
					this.instructions.push(inst)
					break
				}

				case "??": {
					let inst = this.runtimeCoder.opNullishCoalescingOperator(p1, p2)
					this.instructions.push(inst)
					break
				}

				default: {
					this.runtimeWaver.pushError(new runtime.InvalidSymbolError().init({
						name: p.text,
					}))
				}
			}
		}

	}
}
