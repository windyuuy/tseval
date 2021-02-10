
namespace fsync {
	globalThis["fsync"] = fsync

	/**
	 * 创建空表
	 */
	export function EmptyTable() {
		return Object.create(null);
	}
}
