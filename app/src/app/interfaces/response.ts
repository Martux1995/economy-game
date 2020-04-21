export interface Response<T> {
    code: number,
    msg: string,
    data: T
}

export interface ResponseError<T> {
    code: number,
    msg: string,
    err: T
}