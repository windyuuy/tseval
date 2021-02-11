
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
		 * 获取变量调试信息
		 * @param p 
		 * @param index 
		 */
		protected getVar(p: pgparser.MatchedResult, index: number): runtime.VarID {
			return {
			}
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
			switch (p.text) {
				case "+": {
					let inst = this.runtimeCoder.add(this.getVar(p, 0), this.getVar(p, 1))
					this.instructions.push(inst)
					break;
				}

				case "-": {
					let inst = this.runtimeCoder.sub(this.getVar(p, 0), this.getVar(p, 1))
					this.instructions.push(inst)
					break
				}

				case "*": {
					let inst = this.runtimeCoder.mult(this.getVar(p, 0), this.getVar(p, 1))
					this.instructions.push(inst)
					break
				}

				case "/": {
					let inst = this.runtimeCoder.div(this.getVar(p, 0), this.getVar(p, 1))
					this.instructions.push(inst)
					break
				}
			}
		}

	}
}
