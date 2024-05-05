import { Injectable } from "@nestjs/common";
import { HttpService } from '@nestjs/axios';
import { HTTP_METHOD } from "src/common/constants/common.enum";

interface AxiosResponseType {
    response: any,
    totalExecutionTime: any
}

@Injectable()
export class AxiosService {

    constructor(private readonly httpService: HttpService) { }

    async sendRequest(url: string, method: HTTP_METHOD, data?: any, headers?: any): Promise<AxiosResponseType> {

        const startTime = new Date().getTime();
        const response = await this.httpService.axiosRef({
            url,
            method,
            data,
            headers
        });
        const endTime = new Date().getTime();
        const totalExecutionTime = (endTime - startTime) / 1000;
        return {
            response,
            totalExecutionTime
        }

    }
}