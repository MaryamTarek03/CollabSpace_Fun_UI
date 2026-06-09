import * as signalR from "@microsoft/signalr";
import { httpClient } from "./httpClient.js";

class SignalRService {
    connection = null;
    joinedSpaceIds = new Set();
    handlers = {};

    start(token) {
        console.log("[SignalR Service] start() called. Token exists:", !!token);
        if (this.connection) {
            console.log("[SignalR Service] Connection already exists. Current state:", this.connection.state);
            return;
        }

        const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'http://localhost:5153/chathub';
        console.log("[SignalR Service] Connecting to Hub URL:", hubUrl);

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(hubUrl, {
                accessTokenFactory: () => token
            })
            .configureLogging(signalR.LogLevel.Information)
            .withAutomaticReconnect()
            .build();

        // Bind listeners
        this.connection.on("ReceiveMessage", (message) => {
            console.log("[SignalR Service] Broadcast: ReceiveMessage", message);
            if (this.handlers.onMessageReceived) {
                this.handlers.onMessageReceived(message);
            }
        });

        this.connection.on("MessageEdited", (message) => {
            console.log("[SignalR Service] Broadcast: MessageEdited", message);
            if (this.handlers.onMessageEdited) {
                this.handlers.onMessageEdited(message);
            }
        });

        this.connection.on("MessageDeleted", (info) => {
            console.log("[SignalR Service] Broadcast: MessageDeleted", info);
            if (this.handlers.onMessageDeleted) {
                this.handlers.onMessageDeleted(info);
            }
        });

        this.connection.on("ReceiveNotification", (notification) => {
            console.log("[SignalR Service] Broadcast: ReceiveNotification", notification);
            if (this.handlers.onNotificationReceived) {
                this.handlers.onNotificationReceived(notification);
            }
        });

        console.log("[SignalR Service] Invoking connection.start()...");
        this.connection.start()
            .then(() => {
                console.log("[SignalR Service] Hub Connected successfully.");
                this.joinedSpaceIds.forEach(spaceId => {
                    console.log("[SignalR Service] Re-joining space:", spaceId);
                    this.connection.invoke("JoinSpace", spaceId)
                        .catch(err => console.error("[SignalR Service] Re-join Space error: ", err));
                });
            })
            .catch(err => {
                console.error("[SignalR Service] Connection start failed with error:", err);
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
