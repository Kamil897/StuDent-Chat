import { Injectable } from '@nestjs/common';

@Injectable()
export class AiStatusService {
  private running = true; // по умолчанию включено

  async getStatus() {
    return { running: this.running };
  }

  async setStatus(running: boolean) {
    this.running = running;
    return { running: this.running };
  }

  isRunning() {
    return this.running;
  }
}
