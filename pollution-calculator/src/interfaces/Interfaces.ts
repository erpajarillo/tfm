export interface calculatePollutionResponseInterface {
    msg: string,
    status: boolean
}

export interface ExceptionServiceInterface {
    captureException(err: any): any
}