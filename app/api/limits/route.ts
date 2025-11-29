import { NextResponse } from 'next/server';
// We'll call Clerk REST API directly to avoid runtime/client type mismatches
const CLERK_API_URL = process.env.CLERK_API_URL || 'https://api.clerk.com';
const CLERK_SECRET = process.env.CLERK_SECRET_KEY || process.env.CLERK_API_KEY || process.env.CLERK_KEY;

if (!CLERK_SECRET) {
  console.warn('CLERK_SECRET_KEY not set — Clerk API calls will fail.');
}

const LIMIT = 50;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours (86400 seconds)

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');
    if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 });

    // Get user via Clerk REST API
    const resp = await fetch(`${CLERK_API_URL}/v1/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return NextResponse.json({ error: `Clerk GET error: ${txt}` }, { status: resp.status });
    }
    const user = await resp.json();
    let meta = (user.private_metadata as any)?.contactLimits || (user.public_metadata as any)?.contactLimits || null;

    // ✅ IMPORTANT: Vérifier si la fenêtre de 24h a expiré
    let timeLeft = 0;
    if (meta?.firstViewAt) {
      const elapsed = Date.now() - new Date(meta.firstViewAt).getTime();
      console.log(`⏱️ GET /api/limits: elapsed=${elapsed}ms, WINDOW_MS=${WINDOW_MS}, expired=${elapsed >= WINDOW_MS}`);
      
      if (elapsed >= WINDOW_MS) {
        // 🔄 La fenêtre a expiré - réinitialiser
        console.log('✅ Réinitialisation détectée en GET!');
        meta = {
          firstViewAt: new Date().toISOString(),
          viewedContactIds: []
        };
        
        // Sauvegarder le reset dans Clerk
        await fetch(`${CLERK_API_URL}/v1/users/${encodeURIComponent(userId)}`, {
          method: 'PATCH',
          headers: {
            Authorization: `Bearer ${CLERK_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ private_metadata: { contactLimits: meta } }),
        });
        // Après reset, timeLeft = WINDOW_MS (nouvelle fenêtre de 24h)
        timeLeft = WINDOW_MS;
      } else {
        // Calculer le temps restant avant réinitialisation
        timeLeft = WINDOW_MS - elapsed;
      }
    } else {
      // Pas de firstViewAt, donc pas de limite active, timeLeft = 0
      timeLeft = 0;
    }

    return NextResponse.json({ meta, timeLeft });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, contactIds = [] } = body || {};
    if (!userId) return NextResponse.json({ error: 'missing userId' }, { status: 400 });

    // fetch user via Clerk REST API
    const getResp = await fetch(`${CLERK_API_URL}/v1/users/${encodeURIComponent(userId)}`, {
      headers: {
        Authorization: `Bearer ${CLERK_SECRET}`,
        'Content-Type': 'application/json',
      },
    });
    if (!getResp.ok) {
      const txt = await getResp.text();
      return NextResponse.json({ error: `Clerk GET error: ${txt}` }, { status: getResp.status });
    }
    const user = await getResp.json();
    const existing = (user.private_metadata as any)?.contactLimits || (user.public_metadata as any)?.contactLimits || null;

    const now = new Date().toISOString();
    let firstViewAt = existing?.firstViewAt || null;
    let viewedSet = new Set<string>(existing?.viewedContactIds || []);

    // If there's a firstViewAt, check window age
    if (firstViewAt) {
      const elapsed = Date.now() - new Date(firstViewAt).getTime();
      if (elapsed >= WINDOW_MS) {
        // Reset window
        firstViewAt = now;
        viewedSet = new Set<string>();
      }
    } else {
      firstViewAt = now;
    }

    const before = viewedSet.size;
    for (const id of contactIds) viewedSet.add(id);
    const after = viewedSet.size;

    // If already at limit, do not allow adding new contacts
    if (before >= LIMIT) {
      return NextResponse.json({ allowed: false, count: before, remaining: 0, viewedContactIds: Array.from(viewedSet), firstViewAt });
    }

    // If adding these causes us to exceed the limit, clamp and deny the extra
    if (after > LIMIT) {
      // Keep only the earliest LIMIT ids — set is not ordered, so slice by insertion order approximated by array
      const arr = Array.from(viewedSet).slice(0, LIMIT);
      viewedSet = new Set(arr);

      // persist truncated set via Clerk REST API
      await fetch(`${CLERK_API_URL}/v1/users/${encodeURIComponent(userId)}`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${CLERK_SECRET}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ private_metadata: { contactLimits: { firstViewAt, viewedContactIds: Array.from(viewedSet) } } }),
      });

      return NextResponse.json({ allowed: false, count: viewedSet.size, remaining: Math.max(0, LIMIT - viewedSet.size), viewedContactIds: Array.from(viewedSet), firstViewAt });
    }

    // Allowed: persist new state
    await fetch(`${CLERK_API_URL}/v1/users/${encodeURIComponent(userId)}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${CLERK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ private_metadata: { contactLimits: { firstViewAt, viewedContactIds: Array.from(viewedSet) } } }),
    });

    return NextResponse.json({ allowed: true, count: viewedSet.size, remaining: Math.max(0, LIMIT - viewedSet.size), viewedContactIds: Array.from(viewedSet), firstViewAt });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
