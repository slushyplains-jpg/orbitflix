//#region node_modules/.nitro/vite/services/ssr/assets/__23tanstack-start-server-fn-resolver-sacnbM7V.js
var manifest = { "104ab998a74b2c68797d912e64133b8591b961b4d1026dcb4caaa6e711018f75": {
	functionName: "askConcierge_createServerFn_handler",
	importer: () => import("./_ssr/concierge-ChbAWnI5.mjs")
} };
async function getServerFnById(id, access) {
	const serverFnInfo = manifest[id];
	if (!serverFnInfo) throw new Error("Server function info not found for " + id);
	const fnModule = serverFnInfo.module ?? await serverFnInfo.importer();
	if (!fnModule) throw new Error("Server function module not resolved for " + id);
	const action = fnModule[serverFnInfo.functionName];
	if (!action) throw new Error("Server function module export not resolved for serverFn ID: " + id);
	return action;
}
//#endregion
export { getServerFnById as t };
