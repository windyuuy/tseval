
namespace runtime {
	/**
	 * 变量ID
	 */
	export type VarID = string;
	/**
	 * 即时执行指令
	 */
	export type JITInstruction = [(session: RuntimeSession) => void, string, any?, any?]

	/**
	 * 运行时动态会话
	 */
	export class RuntimeSession {

		/**
		 * 栈
		 */
		stack: any[] = []

		pop(): any {

		}

		push(value: any): void {

		}

		/**
		 * 局部变量
		 */
		locals: { [key: string]: any } = Object.create(null)
		setVar(key: VarID, value: any): void {

		}

		getVar(key: VarID): any {

		}

		/**
		 * 导出变量
		 */
		exports: { [key: string]: any } = Object.create(null)
		setExport(key: VarID, value: any) {

		}
	}
}
