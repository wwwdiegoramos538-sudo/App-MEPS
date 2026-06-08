const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meps.com', password: 'Admin123!' }),
  });

  if (!loginRes.ok) {
    const text = await loginRes.text();
    throw new Error(`Login failed: ${loginRes.status} ${text}`);
  }

  const { token } = await loginRes.json();

  const createRes = await fetch('http://localhost:4000/api/audiobooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: 'Audiolibro test',
      sourceText: 'Hola. Esto es una prueba de audiolibro en MEPS.',
      language: 'es',
      voice: 'alloy',
    }),
  });

  const startBody = await createRes.json().catch(() => ({}));
  if (!createRes.ok) {
    throw new Error(`Create failed: ${createRes.status} ${JSON.stringify(startBody)}`);
  }

  const audiobook = startBody.audiobook;
  console.log('Created:', audiobook.id, audiobook.status);

  // En fallback wav normalmente termina rápido, pero hacemos polling por seguridad.
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    const pollRes = await fetch(`http://localhost:4000/api/audiobooks/${audiobook.id}/download`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => null);
    // Si el endpoint de download devuelve 200, ya hay audioPath.
    if (pollRes && pollRes.ok) {
      const buf = Buffer.from(await pollRes.arrayBuffer());
      console.log('Download OK. Bytes:', buf.byteLength);
      return;
    }
  }

  console.log('Audio not ready in time.');
  process.exit(1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

