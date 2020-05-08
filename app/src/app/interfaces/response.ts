import { HttpErrorResponse } from '@angular/common/http';

export interface Response<T = null> {
    msg: string,
    data?: T
}

export interface ErrorResponse<T = null> extends HttpErrorResponse {
    error: {
        code: number,
        msg: string,
        err?: T
    }
}