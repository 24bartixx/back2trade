import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): string {
    return "Api docs => http://localhost:3000/api  ";
  }
}
