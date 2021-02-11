
namespace easytest {
	export class TAutoTest {
		protected calls: Function[] = []
		addFunc(tip: string, call: Function) {
			this.calls.push(call)
			return this
		}
		protected testOnly = -1
		/**
		 * 只测试此项
		 */
		itOnly() {
			this.testOnly = this.calls.length
		}

		getTests() {
			let calls: Function[]
			if (this.testOnly >= 0) {
				calls = [this.calls[this.testOnly]]
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
					console.error("Test Failed:", e.name, ":", e.message, e)
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
		AutoTestManager.forEachTest(AutoTest)
	}, 0)

	globalThis.easytest = easytest
}
