
namespace easytest {
	export class TAutoTest {
		protected calls: Function[] = []
		addFunc(tip: string, call: Function) {
			this.calls.push(call)
			return this
		}
		protected testOnlys: number[] = []
		/**
		 * 只测试此项
		 */
		only() {
			this.testOnlys.push(this.calls.length - 1)
			return this
		}

		/**
		 * 跳过测试此项
		 */
		skip() {
			this.calls.pop()
		}

		/**
		 * 获取所有待测试项
		 */
		getTests() {
			let calls: Function[]
			if (this.testOnlys.length > 0) {
				calls = this.testOnlys.map(index => this.calls[index])
			} else {
				calls = this.calls.concat()
			}
			return calls
		}
	}

	export const AutoTest = new TAutoTest()

	export class TAutoTestManager {
		forEachTest(tests: TAutoTest) {
			let calls = tests.getTests()
			let total = calls.length
			let okCount = 0
			let failedCount = 0
			calls.forEach((f) => {
				try {
					f()
					okCount += 1
				} catch (e) {
					failedCount += 1
					console.error("Test Failed:", e.name, ":", e.message)
					console.error(e.stack)
				}
			})

			let summary = "all passed"
			if (failedCount != 0) {
				summary = "partly failed"
			}
			console.log("===========================================================")
			console.log(`= run test result: <${summary}>[total: ${total}, ok: ${okCount}, failed: ${failedCount}]`)
			console.log("===========================================================")
		}
	}
	export const AutoTestManager = new TAutoTestManager()

	setTimeout(() => {
		try {
			AutoTestManager.forEachTest(AutoTest)
		} catch (e) {
			console.error(e.name, "Error:", e.message, "\n", e.stack)
		}
	}, 0)

	globalThis.easytest = easytest
}
