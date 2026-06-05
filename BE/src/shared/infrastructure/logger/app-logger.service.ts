import { ConsoleLogger, Injectable } from "@nestjs/common";

@Injectable()
export class AppLogger extends ConsoleLogger {
  constructor() {
    super("onehand-sales-backend", {
      timestamp: true,
    });
  }
}
