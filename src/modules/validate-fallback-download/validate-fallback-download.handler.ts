import env from '@/config/env';
import cheerio from 'cheerio';
import { FastifyRequest, FastifyReply } from 'fastify';
import { OpenAI } from 'openai';

interface ValidateFallbackRequest
  extends FastifyRequest<{
    Body: {
      softwareName: string;
      platform: string;
      fallbackUrl: string;
      referrer: string;
    };
  }> {}

export const validateFallbackDownloadHandler = async (
  request: ValidateFallbackRequest,
  reply: FastifyReply,
) => {
  const { softwareName, platform, fallbackUrl, referrer } = request.body;

  if (!softwareName || !fallbackUrl) {
    return reply
      .status(400)
      .send({ url: undefined, reason: 'Missing parameters' });
  }

  // console.log('[validateFallbackDownload] Checking', fallbackUrl)
  try {
    const res = await fetch(fallbackUrl);
    const html = await res.text();
    const $ = cheerio.load(html);
    const title = $('title').text().trim();
    const textSnippet = $('body').text().replaceAll(/\s+/g, ' ').slice(0, 800);

    // Build the GPT prompt
    const prompt = `You are verifying if a given link is the actual, legitimate download link for a software.

Context:
- Software name: "${softwareName}"
- Platform: "${platform}"
- Referrer page: ${referrer}
- Candidate download link: ${fallbackUrl}
- Page title: "${title}"
- Page snippet: "${textSnippet}"

Question:
Is "${fallbackUrl}" the official or direct download link for "${softwareName}"?

Only answer "yes" if it's a **direct and trustworthy** installer download link.
Otherwise, answer "no".

Answer with just "yes" or "no".`;

    const openai = new OpenAI({ apiKey: env.openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const verdict = completion.choices[0]?.message?.content
      ?.trim()
      .toLowerCase();

    const validUrl = verdict === 'yes' ? fallbackUrl : undefined;
    return reply.code(200).send({ url: validUrl ?? undefined });
  } catch (error: any) {
    return reply.code(500).send({ url: undefined, error: error.message });
  }
};
