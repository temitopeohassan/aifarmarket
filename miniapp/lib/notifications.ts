import { db } from './firebaseAdmin';

export async function sendFarcasterNotification({
  fid,
  title,
  body,
  targetUrl,
}: {
  fid: number;
  title: string;
  body: string;
  targetUrl: string;
}) {
  try {
    // 1. Get the token from Firestore
    const userDoc = await db.collection('users').doc(fid.toString()).get();
    const data = userDoc.data();

    if (!data?.notificationToken || !data?.notificationUrl) {
      return { success: false, error: "No notification config found" };
    }

    // 2. Send to Farcaster's Notification Server
    const response = await fetch(data.notificationUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        notificationId: `msg-${Date.now()}`, // Dedupes if retried within 24h
        tokens: [data.notificationToken],
        title,
        body,
        targetUrl, // Where the user lands when they click
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Farcaster notification error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Error sending notification:', error);
    return { success: false, error };
  }
}
