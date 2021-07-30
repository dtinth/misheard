import * as Y from "yjs";
import { WebrtcProvider } from "y-webrtc";

type Message = {
  text: string
  name: string
  createdAt: string
}

const ydoc = new Y.Doc();
const provider = new WebrtcProvider("misheard", ydoc);
export const sharedState = ydoc.getMap("state");
export const sharedMessages = ydoc.getArray<Message>("messages");
