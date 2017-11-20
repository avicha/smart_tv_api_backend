module.exports = class BaseController {
    success_with_result(result) {
        return {
            errcode: 0,
            result
        }
    }
    success() {
        return {
            errcode: 0
        }
    }
    success_with_list_result(total_rows, result) {
        return {
            errcode: 0,
            total_rows,
            result
        }
    }
    error_with_message(errcode, errmsg) {
        return {
            errcode,
            errmsg
        }
    }
}