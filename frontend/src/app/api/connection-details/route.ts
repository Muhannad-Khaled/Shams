import { AccessToken } from 'livekit-server-sdk';
import { NextResponse } from 'next/server';

export async function POST() {
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;
  const serverUrl = process.env.LIVEKIT_URL;

  if (!apiKey || !apiSecret || !serverUrl) {
    return NextResponse.json(
      { error: 'LiveKit credentials not configured' },
      { status: 500 }
    );
  }

  const roomName = `voice-room-${Math.random().toString(36).substring(2, 9)}`;
  const participantName = `user-${Math.random().toString(36).substring(2, 9)}`;

  const at = new AccessToken(apiKey, apiSecret, {
    identity: participantName,
    ttl: '15m',
  });

  at.addGrant({
    roomJoin: true,
    room: roomName,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });

  const token = await at.toJwt();

  return NextResponse.json({
    serverUrl,
    roomName,
    participantName,
    participantToken: token,
  });
}
