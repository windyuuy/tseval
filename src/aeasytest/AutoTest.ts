
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
			tests.calls.forEach((f) => {
				try {
					f()
				} catch (e) {
					console.error("Test Failed:", e)
					console.error(e.stack)
				}
			})
		}
	}
	export const AutoTestManager = new TAutoTestManager()

	setTimeout(() => {
		AutoTestManager.forEachTest(AutoTest)
	}, 0)

	globalThis.easytest = easytest
}
