
namespace easytest {
	export function assert(cond: boolean, message: string = "Error: assert failed!!") {
		if (!cond) {
			throw new Error(message);
		}
	}

	/**
	 * 期待异常发生
	 * @param call 
	 * @param clses 
	 */
	export function expect_exception(call: Function, message?: string, ...clses: (new (msg?: string) => any)[]) {
		let over = false
		try {
			call()
			over = true
		} catch (e) {
			if (clses.length == 0) {
				return
			}
			for (let cls of clses) {
				if (e instanceof cls) {
					return
				}
			}
			throw e
		}

		if (over) {
			throw new Error("expect exception not happened:" + message)
		}
	}
}
