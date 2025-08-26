"use strict";
// Cross-App Authentication SDK Types
Object.defineProperty(exports, "__esModule", { value: true });
exports.CrossAppAuthError = exports.AppStatus = exports.AppPermission = void 0;
var AppPermission;
(function (AppPermission) {
    AppPermission["READ_USER_INFO"] = "read_user_info";
    AppPermission["READ_CREDITS"] = "read_credits";
    AppPermission["PURCHASE_CREDITS"] = "purchase_credits";
    AppPermission["CONSUME_CREDITS"] = "consume_credits";
    AppPermission["MANAGE_SUBSCRIPTIONS"] = "manage_subscriptions";
    AppPermission["READ_ANALYTICS"] = "read_analytics";
})(AppPermission || (exports.AppPermission = AppPermission = {}));
var AppStatus;
(function (AppStatus) {
    AppStatus["ACTIVE"] = "active";
    AppStatus["INACTIVE"] = "inactive";
    AppStatus["SUSPENDED"] = "suspended";
    AppStatus["PENDING_APPROVAL"] = "pending_approval";
})(AppStatus || (exports.AppStatus = AppStatus = {}));
class CrossAppAuthError extends Error {
    constructor(message, code, details) {
        super(message);
        this.name = 'CrossAppAuthError';
        this.code = code;
        this.details = details;
        this.timestamp = Date.now();
    }
}
exports.CrossAppAuthError = CrossAppAuthError;
//# sourceMappingURL=auth.js.map