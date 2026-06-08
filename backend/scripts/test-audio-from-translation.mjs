const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const loginRes = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@meps.com', password: 'Admin123!' }),
  });
  if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
  const { token } = await loginRes.json();

  const testFilePath = 'C:\\Users\\MINEDUCYT\\Desktop\\App-MEPS\\backend\\uploads\\test-translate.txt';

  const fileBytes = await (await import('fs')).promises.readFile(testFilePath);
  const form = new FormData();
  form.append('file', new Blob([fileBytes], { type: 'text/plain' }), 'test-translate.txt');
  form.append('sourceLanguage', 'es');
  form.append('targetLanguage', 'en');
  form.append('provider', 'auto');

  const startRes = await fetch('http://localhost:4000/api/translations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const startBody = await startRes.json();
  if (!startRes.ok) throw new Error(`Translation start failed: ${startRes.status} ${JSON.stringify(startBody)}`);
  const translationId = startBody.translation.id;

  let translation = null;
  for (let i = 0; i < 60; i++) {
    await sleep(2000);
    const pollRes = await fetch(`http://localhost:4000/api/translations/${translationId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pollBody = await pollRes.json();
    if (!pollRes.ok) throw new Error(`Translation poll failed: ${pollRes.status}`);
    translation = pollBody.translation;
    if (translation.status === 'COMPLETED' || translation.status === 'FAILED') break;
  }

  if (!translation) throw new Error('No translation');
  if (translation.status !== 'COMPLETED') throw new Error(`Translation not completed: ${translation.status}`);

  const audioRes = await fetch('http://localhost:4000/api/audiobooks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      title: `Audio de ${translationId.slice(0, 8)}`,
      sourceText: translation.translatedText,
      language: 'en',
      voice: 'alloy',
    }),
  });
  const audioBody = await audioRes.json();
  if (!audioRes.ok) throw new Error(`Audiobook create failed: ${audioRes.status} ${JSON.stringify(audioBody)}`);

  const abId = audioBody.audiobook.id;

  const dlRes = await fetch(`http://localhost:4000/api/audiobooks/${abId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!dlRes.ok) throw new Error(`Download failed: ${dlRes.status}`);

  const buf = Buffer.from(await dlRes.arrayBuffer());
  console.log('Audio bytes:', buf.byteLength, 'status:', audioBody.audiobook.status);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

