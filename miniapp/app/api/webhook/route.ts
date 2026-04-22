import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event, notificationDetails, fid } = body;

    // Event types: "user_added" or "notifications_enabled"
    if (notificationDetails) {
      const { token, url } = notificationDetails;

      // Save to Firestore: users/{fid}/notifications/config
      await db.collection('users').doc(fid.toString()).set({
        notificationToken: token,
        notificationUrl: url,
        notificationsEnabled: true,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
      
      console.log(`Notifications enabled for FID: ${fid}`);
    }

    // Handle uninstalls
    if (event === "user_removed") {
      await db.collection('users').doc(fid.toString()).update({
        notificationsEnabled: false
      });
      console.log(`User removed app: FID ${fid}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
