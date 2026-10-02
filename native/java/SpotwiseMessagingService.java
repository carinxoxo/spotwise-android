package com.spotwise.app;

import com.google.firebase.messaging.FirebaseMessagingService;
import com.google.firebase.messaging.RemoteMessage;
import java.util.Map;

// Receives Spotwise notifications from Firebase while the app is open.
public class SpotwiseMessagingService extends FirebaseMessagingService {
    @Override
    public void onMessageReceived(RemoteMessage msg) {
        Map<String, String> data = msg.getData();
        String title = msg.getNotification() != null ? msg.getNotification().getTitle() : data.get("title");
        String body = msg.getNotification() != null ? msg.getNotification().getBody() : data.get("body");
        if (title == null && body == null) return;
        SpotwiseNotify.show(this, title == null ? "Spotwise" : title, body == null ? "" : body, data.get("tag"));
    }

    @Override
    public void onNewToken(String token) {
        SpotwiseNotify.subscribe();
    }
}
