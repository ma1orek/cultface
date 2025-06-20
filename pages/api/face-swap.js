import fetch from 'node-fetch';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    sourceBase64,
    videoUrl,
    pixelBoost = '384x384',
    faceSelectorMode = 'reference',
    faceSelectorOrder = 'large-small',
    ageStart = 0,
    ageEnd = 100,
    faceDistance = 0.6,
    frameNumber = 1,
    demoFallback = '/demo.mp4',
  } = req.body;

  const apiKey = process.env.SEGMIND_API_KEY;
  const endpoint = 'https://api.segmind.com/v1/ai-face-swap';

  const payload = {
    source_image: sourceBase64,
    target: videoUrl,
    pixel_boost: pixelBoost,
    face_selector_mode: faceSelectorMode,
    face_selector_order: faceSelectorOrder,
    face_selector_age_start: ageStart,
    face_selector_age_end: ageEnd,
    reference_face_distance: faceDistance,
    reference_frame_number: frameNumber,
    base64: false,
  };

  try {
    const apiRes = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (apiRes.status === 429) {
      // Too many requests → pokaż demo
      return res.status(200).json({ demo: true, url: demoFallback });
    }

    if (!apiRes.ok) {
      const text = await apiRes.text();
      return res.status(apiRes.status).json({ error: text });
    }

    // Zwróć strumień binarny MP4
    const arrayBuffer = await apiRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.setHeader('Content-Type', 'video/mp4');
    res.send(buffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
}
