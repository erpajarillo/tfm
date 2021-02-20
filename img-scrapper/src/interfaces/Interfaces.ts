export interface awsResponseInterface {
    msg: string,
    status: boolean
}

export interface scrapeResponseInterface {
    msg: string,
    status: boolean
}

export interface downloadImageInterface {
    msg: string,
    status: boolean,
    image: any
}

export interface CloudServiceInterface {
    storeImage(imgName: string, response: any) : Promise<awsResponseInterface>
}

export interface EventServiceInterface {
    produce(value: string, headers: {}) : any,
    consume() : any
}

export interface ExceptionServiceInterface {
    captureException(err: any) : any
}