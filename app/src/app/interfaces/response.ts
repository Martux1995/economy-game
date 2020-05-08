export interface Response<T= null> {
    msg: string,
    data?: T
}

export interface ResponseError<T> {
    code: number,
    msg: string,
    err: T
}