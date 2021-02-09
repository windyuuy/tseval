
namespace easytest {
	export class TAutoTest {
		calls: Function[] = []
		addFunc(call: Function) {
			this.calls.push(call)
		}
	}

	export const AutoTest = new TAutoTest()

	export class TAutoTestManager {
		forEachTest(tests: TAutoTest) {
			let total = tests.calls.length
			let okCount = 0
			let failedCount = 0
			tests.calls.forEach((f) => {
				try {
					f()
					okCount += 1
				} catch (e) {
					failedCount += 1
					console.error("Test Failed:", e)
					console.error(e.stack)
				}
			})

			let summary = "all passed"
			if (failedCount != 0) {
				summary = "partly failed"
			}
			console.log("==================================================")
			console.log(`= run test result: <${summary}>[total: ${total}, ok: ${okCount}, failed: ${failedCount}]`)
			console.log("==================================================")
		}
	}
	export const AutoTestManager = new TAutoTestManager()

	setTimeout(() => {
		AutoTestManager.forEachTest(AutoTest)
	}, 0)

	globalThis.easytest = easytest
}
