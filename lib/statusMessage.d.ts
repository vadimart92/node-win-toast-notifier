import { DismissReason } from "./dismissReason.js";
import { StatusMessageType } from "./statusMessageType.js";
import { StatusMessageInfo } from "./statusMessageInfo.js";
export interface StatusMessage {
    id: string;
    info?: StatusMessageInfo;
    dismissReason?: DismissReason;
    type: StatusMessageType;
    description: string;
}
