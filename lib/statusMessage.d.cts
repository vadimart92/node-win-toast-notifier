import { DismissReason } from "./dismissReason.cjs";
import { StatusMessageType } from "./statusMessageType.cjs";
import { StatusMessageInfo } from "./statusMessageInfo.cjs";
export interface StatusMessage {
    id: string;
    info?: StatusMessageInfo;
    dismissReason?: DismissReason;
    type: StatusMessageType;
    description: string;
}
