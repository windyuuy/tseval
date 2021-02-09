
namespace easytest {
	export function assert(cond: boolean, message: string = "Error: assert failed!!") {
		if (!cond) {
			console.error(message);
		}
	}
}
