import { ChildProcessWithoutNullStreams, spawn } from "child_process";
import { Notification } from "./notification.js";
import { NotifierSettings } from "./notifierSettings.js";
import path from "path";
import { fileURLToPath } from "url";
import fetch, { HeadersInit } from "node-fetch";
import { StatusMessage } from "./statusMessage.js";

interface NotifierConfig {
  application_id: string;
  api_key: string;
  ip: string;
  port?: number;
}

interface NotifyResponse {
  id: string
}

export class Notifier {
  public static BinaryPath: string =  path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../bin/win-toast-notifier.exe",
  );
  private _process?: ChildProcessWithoutNullStreams;
  private _onReady?: Function;
  private readonly _onReadyPromise: Promise<void>;
  private _config: NotifierConfig = {
    api_key: "1",
    ip: "127.0.0.1",
    application_id: "",
  };
  private _notifications: Map<string, Notification> = new Map<
    string,
    Notification
  >();

  constructor(settings: NotifierSettings) {
    this._onReadyPromise = new Promise((resolve) => (this._onReady = resolve));
    this._config.port = settings.port;
    this._config.api_key = settings.api_key ?? this._config.api_key;
    this._config.application_id =
      settings.application_id ?? this._config.application_id;
    this._config.ip = settings.ip ?? this._config.ip;
    if (settings.connectToExistingService) {
      this._subscribeForEvents();
      this._onReady?.();
      return;
    }
    this._startService();
  }

  private _startService() {
    let args = [
      "listen",
      "-k",
      this._config.api_key,
      "-a",
      this._config.application_id,
    ];
    if (this._config.port) {
      args.push("-p", this._config.port.toString());
    }
    this._process = spawn(Notifier.BinaryPath, args);
    let fullData = "";
    this._process.stdout.on("data", (data) => {
      fullData += data;
      try {
        this._config = JSON.parse(fullData) as NotifierConfig;
        console.debug(`CONFIG: ${fullData}`);
        this._subscribeForEvents();
        this._onReady?.();
      } catch (e) {}
    });
    this._process.stderr.on("data", (data) => {
      console.error(`Notifier error: ${data}`);
    });
    this._process.on("close", (code) => {
      if (code !== 0) console.debug(`child process exited with code ${code}`);
    });
  }

  _waitForReady(): Promise<void> {
    return this._onReadyPromise ?? Promise.resolve();
  }

  private _getHeaders(): HeadersInit {
    return {
      "api-key": this._config.api_key,
    };
  }

  private _getUrl(path: string) {
    return `http://${this._config.ip}:${this._config.port}/${path}`;
  }

  private _lastStatusMessageNumber: number = 0;

  private async _subscribeForEvents() {
    const response = await fetch(
      this._getUrl(`status-stream?from=${this._lastStatusMessageNumber}`),
      {
        headers: this._getHeaders(),
      },
    );
    if (!response.body) {
      console.error(`Could not subscribe to status stream`);
      return;
    }
    let lastChunk = "";
    try {
      for await (const chunkBuffer of response.body) {
        let chunk = lastChunk + chunkBuffer.toString();
        lastChunk = "";
        let lines = chunk?.split("\n");
        try {
          for (const line of lines) {
            if (!line?.length) {
              continue;
            }
            let statusMessage = JSON.parse(line) as StatusMessage;
            let notification = this._notifications.get(statusMessage.id);
            if (notification) {
              if (notification.statusChanged(statusMessage)) {
                this._notifications.delete(statusMessage.id);
              }
            }
          }
        } catch (err) {
          if (lines?.length) {
            lastChunk += lines[lines.length - 1];
          }
        }
      }
    } catch (e) {}
  }

  async close() {
    const result = await fetch(this._getUrl("quit"), {
      headers: this._getHeaders(),
    });
    const response = await result.text();
    console.debug(`App quit: ${response}`);
    this._process?.kill("SIGTERM");
  }

  async notifyRaw(xml: string) {
    let url = this._getUrl("notify");
    let config = {
      method: "POST",
      body: JSON.stringify({
        toast_xml: xml,
      }),
      headers: this._getHeaders(),
    };
    let response = await fetch(url, config);
    let response_json = (await response.json()) as NotifyResponse;
    let notification = new Notification(this, response_json.id);
    this._notifications.set(notification.id, notification);
    return notification;
  }

  async remove(notification: Notification) {
    console.debug(`Removing ${notification.id}`);
    let result = await fetch(
      this._getUrl(`notification?id=${notification.id}`),
      {
        headers: this._getHeaders(),
        method: "DELETE",
      },
    );
    if (result.ok) {
      console.debug(`Removed ${notification.id}`);
    }
  }
}
