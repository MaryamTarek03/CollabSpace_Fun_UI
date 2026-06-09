import * as signalR from "@microsoft/signalr";
import { httpClient } from "./httpClient.js";

class SignalRService {
    connection = null;
    joinedSpaceIds = new Set();
    handlers = {};

    start(token) {
        if (this.connection) {
            return;
        }

        const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5153/chathub';

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(`${hubUrl}?access_token=${token}`, {
                skipNegotiation: true,
                transport: signalR.HttpTransportType.WebSockets
            })
            .withAutomaticReconnect()
            .build();

        // Bind listeners
        this.connection.on("ReceiveMessage", (message) => {
            if (this.handlers.onMessageReceived) {
                this.handlers.onMessageReceived(message);
            }
        });

        this.connection.on("MessageEdited", (message) => {
            if (this.handlers.onMessageEdited) {
                this.handlers.onMessageEdited(message);
            }
        });

        this.connection.on("MessageDeleted", (info) => {
            if (this.handlers.onMessageDeleted) {
                this.handlers.onMessageDeleted(info);
            }
        });

        this.connection.on("ReceiveNotification", (notification) => {
            if (this.handlers.onNotificationReceived) {
                this.handlers.onNotificationReceived(notification);
            }
        });

        this.connection.start()
            .then(() => {
                console.log("SignalR Hub Connected successfully.");
                this.joinedSpaceIds.forEach(spaceId => {
                    this.connection.invoke("JoinSpace", spaceId)
                        .catch(err => console.error("Re-join Space error: ", err));
                });
            })
            .catch(err => {
                console.error("SignalR Connection Error: ", err);
                this.connection = null;
            });
    }

    stop() {
        if (this.connection) {
            this.connection.stop()
                .then(() => {
                    console.log("SignalR Connection Stopped.");
                })
                .catch(err => {
                    console.error("Error stopping SignalR: ", err);
                })
                .finally(() => {
                    this.connection = null;
                    this.joinedSpaceIds.clear();
                });
        }
    }

    joinSpace(spaceId) {
        if (!spaceId) return;
        this.joinedSpaceIds.add(spaceId);
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            this.connection.invoke("JoinSpace", spaceId)
                .catch(err => console.error("JoinSpace error: ", err));
        }
    }

    leaveSpace(spaceId) {
        if (!spaceId) return;
        this.joinedSpaceIds.delete(spaceId);
        if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
            this.connection.invoke("LeaveSpace", spaceId)
                .catch(err => console.error("LeaveSpace error: ", err));
        }
    }

    registerHandlers(handlers) {
        this.handlers = { ...this.handlers, ...handlers };
    }
}

export const signalRService = new SignalRService();
export default signalRService;
