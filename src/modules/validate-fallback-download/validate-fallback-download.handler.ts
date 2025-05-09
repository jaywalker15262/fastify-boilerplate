import env from '@/config/env';
import { FastifyRequest, FastifyReply } from 'fastify';
import { OpenAI } from 'openai';

interface Body {
  softwareName: string;
  platform: string;
  fallbackUrl: string;
  referrer: string;
  title: string;
  snippet: string;
}

export const validateFallbackDownloadHandler = async (
  request: FastifyRequest<{ Body: Body }>,
  reply: FastifyReply,
) => {
  const { softwareName, platform, fallbackUrl, referrer, title, snippet } =
    request.body;

  if (!softwareName || softwareName.length < 2 || !fallbackUrl) {
    return reply.status(400).send({
      url: undefined,
      reason: 'Invalid parameters',
    });
  }

  // build GPT prompt from pre-scraped data
  const prompt = `You are verifying if a given link is the actual, legitimate download link for a software.
  
Context:
- Software name: "${softwareName}"
- Platform: "${platform}"
- Referrer page: ${referrer}
- Candidate download link: ${fallbackUrl}
- Page title: "${title}"
- Page snippet: "${snippet}"

Question:
Is "${fallbackUrl}" the official or direct download link for "${softwareName}"?
Only answer "yes" if it's a direct and trustworthy installer download link.
Otherwise, answer "no".

Answer with just "yes" or "no".`;

  try {
    const openai = new OpenAI({ apiKey: env.openaiApiKey });
    const completion = await openai.chat.completions.create({
      model: 'gpt-4.1',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0,
    });
    const verdict = completion.choices[0].message?.content
      ?.trim()
      .toLowerCase();
    const validUrl = verdict === 'yes' ? fallbackUrl : undefined;
    return reply.code(200).send({ url: validUrl });
  } catch (error: any) {
    return reply.code(500).send({ url: undefined, error: error.message });
  }
};
