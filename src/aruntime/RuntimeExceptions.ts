
namespace runtime {
	export class MyError implements Error {
		constructor() {
			this.stack = new Error().stack
		}
		name: string = "MyError"
		get message(): string {
			return ""
		}
		readonly stack: string
		get throwable(): Error {
			// let error = new Error(this.message)
			// error.stack = this.stack
			// error.name = this.name
			// return error
			return this
		}
	}
	/**
	 * 运行时错误
	 */
	export class TSIRuntimeError extends MyError {
		name = "TSIRuntimeError"
	}

	/**
	 * 运行时构建错误
	 */
	export class RuntimeWaverError extends TSIRuntimeError {
		name = "RuntimeWaverError"
	}

	/**
	 * 对不可变量赋值错误
	 */
	export class AssignImmutableError extends RuntimeWaverError {
		name = "AssignImmutableError"
		protected theVar: VarID

		init(v: VarID) {
			this.theVar = v
			return this
		}

		get message(): string {
			return `var ${this.theVar.name} is immultable.`
		}
	}

	/**
	 * 无效符号
	 */
	export class InvalidSymbolError extends RuntimeWaverError {
		name = "InvalidSymbolError"
		protected theVar: VarID

		init(v: VarID) {
			this.theVar = v
			return this
		}

		get message(): string {
			return `var <${this.theVar.name}> is invalid symbol.`
		}
	}

	/**
	 * 无效局部变量引用
	 */
	export class InvalidLocalVarError extends RuntimeWaverError {
		name = "InvalidLocalVarError"
		protected theVar: VarID

		init(v: VarID) {
			this.theVar = v
			return this
		}

		get message(): string {
			return `local var <${this.theVar.name}> undefined.`
		}
	}

	/**
	 * 重复声明的符号
	 */
	export class DuplicatedSymbolDeclaration extends RuntimeWaverError {
		name = "DuplicatedSymbolDeclaration"
		protected theVar: VarID

		init(v: VarID) {
			this.theVar = v
			return this
		}

		get message(): string {
			return `duplicated declaration of symbol <${this.theVar.name}>.`
		}
	}
}
