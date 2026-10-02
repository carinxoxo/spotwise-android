package com.spotwise.app;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.PendingIntent;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import androidx.core.app.NotificationCompat;
import com.google.firebase.messaging.FirebaseMessaging;

final class SpotwiseNotify {
    static final String CHANNEL = "spotwise_alerts";
    static final String TOPIC = "spotwise_market";

    private SpotwiseNotify() {}

    static void subscribe() {
        try {
            FirebaseMessaging.getInstance().subscribeToTopic(TOPIC);
        } catch (Exception ignored) {
            // Firebase not ready yet: the next app start tries again.
        }
    }

    static void createChannel(Context ctx) {
        if (Build.VERSION.SDK_INT < 26) return;
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm == null || nm.getNotificationChannel(CHANNEL) != null) return;
        NotificationChannel ch = new NotificationChannel(CHANNEL, "Market alerts", NotificationManager.IMPORTANCE_HIGH);
        ch.setDescription("Big crypto moves, pump signals and market updates from Spotwise");
        ch.enableVibration(true);
        nm.createNotificationChannel(ch);
    }

    /** Shows a notification (used while the app is open; Android shows them itself when it is closed). */
    static void show(Context ctx, String title, String body, String tag) {
        createChannel(ctx);
        Intent open = ctx.getPackageManager().getLaunchIntentForPackage(ctx.getPackageName());
        if (open == null) open = new Intent(ctx, MainActivity.class);
        open.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK | Intent.FLAG_ACTIVITY_CLEAR_TOP);
        int flags = PendingIntent.FLAG_UPDATE_CURRENT | (Build.VERSION.SDK_INT >= 23 ? PendingIntent.FLAG_IMMUTABLE : 0);
        PendingIntent pi = PendingIntent.getActivity(ctx, 0, open, flags);
        Notification n = new NotificationCompat.Builder(ctx, CHANNEL)
                .setSmallIcon(R.drawable.ic_stat_spotwise)
                .setColor(0xFF7390FF)
                .setContentTitle(title)
                .setContentText(body)
                .setStyle(new NotificationCompat.BigTextStyle().bigText(body))
                .setPriority(NotificationCompat.PRIORITY_HIGH)
                .setAutoCancel(true)
                .setContentIntent(pi)
                .build();
        NotificationManager nm = (NotificationManager) ctx.getSystemService(Context.NOTIFICATION_SERVICE);
        if (nm != null) nm.notify(tag == null ? (int) (System.currentTimeMillis() % 100000) : tag.hashCode(), n);
    }
}
