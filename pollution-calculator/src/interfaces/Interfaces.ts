export interface awsResponseInterface {
    msg: string,
    status: boolean
}

export interface calculatePollutionResponseInterface {
    msg: string,
    status: boolean
}

export interface CloudServiceInterface {
    storeImage(imgName: string, response: any) : Promise<awsResponseInterface>
}

export interface EventServiceInterface {
    produce(topic: string, value: string, headers: {}) : any
}

export interface ExceptionServiceInterface {
    captureException(err: any) : any
}

export interface kafkaDataResponse {

}