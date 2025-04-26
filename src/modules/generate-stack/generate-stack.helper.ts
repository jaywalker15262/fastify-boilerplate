import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateStack(
  description: string,
  osInfo?: { platform: string; arch: string },
) {
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const devKeywords = [
    'developer',
    'dev',
    'code',
    'coding',
    'programming',
    'react',
    'node',
    'python',
    'typescript',
    'backend',
    'frontend',
    'api',
    'script',
    'cli',
    'docker',
    'github',
    'git',
    'fullstack',
    'database',
    'bitbucket',
  ];

  const isDeveloper = devKeywords.some((keyword) =>
    new RegExp(`\\b${keyword}\\b`, 'i').test(description),
  );

  const sharedEnding = `
The alternative MAY include an additional field called "synergizes_with", which is an array of software names (e.g. "Notion (primary)", "Framer (alternative)") that work well with it. Leave it out if not needed.

If a synergistic tool also exists in the "software_stack" (as a primary or alternative), you MAY add "(primary)" or "(alternative)" after its name accordingly.

If the synergistic tool is not listed in the "software_stack", mention its name only — without any parentheses, labels, or annotations.

Return a valid JSON object with this format:
{
  "software_stack": [
    {
      "primary": { ... },
      "alternative": { ... }
    },
    ...
  ]
}

Do NOT include markdown, commentary, or explanations. Return pure JSON only.`;

  const prompt = isDeveloper
    ? `You are a smart assistant for developer environment and software setup.

Only respond when the user has clearly described a development-related business, coding project, or digital team use case.

If the description is too vague, incomplete, or unrelated to development or tooling, respond with a JSON object like:
{
  "software_stack": []
}

Do NOT guess what the user meant. Never respond to irrelevant, unsafe, or inappropriate inputs.

Respond as a single JSON object with a top-level key called "software_stack", which is an array of software, dev tools, libraries, or system components.

Each item in "software_stack" should represent one install step, and MUST include:
- primary: the best overall tool or software for this role
- alternative: ONE (and only one) alternative tool, which may be a better fit in certain cases
- Each of these (primary and alternative) must include:
  - software_name
  - type (CLI, IDE, Desktop, Library / SDK, SaaS, Extension, Cloud Service - or types of that nature and naming convention)
  - purpose
  - install_order (integer, starting from 1)
  - os_requirements (e.g. "Windows 10 or later", "macOS 13+")
  - software_prerequisites (e.g. ".NET Framework", "C++ Redistributables" — return "None" if not needed)
  - user_prerequisites (e.g. "Create account", "Purchase license" — return "None" if not needed)${sharedEnding}`
    : `You are a smart assistant for business software setup.

Only respond when the user has clearly described a business context or digital team use case.

If the description is too vague, incomplete, or unrelated to business software, respond with a JSON object like:
{
  "software_stack": []
}

Do NOT guess what the user meant. Never respond to irrelevant, unsafe, or inappropriate inputs.

Respond as a single JSON object with a top-level key called "software_stack", which is an array of software tools.

Each item in "software_stack" should represent one install step, and MUST include:
- primary: the best overall tool or software for this role
- alternative: ONE (and only one) alternative tool, which may be a better fit in certain cases
- Each of these (primary and alternative) must include:
  - software_name
  - type (Web App, Desktop App, Mobile App, Command Line Tool, Browser Extension, IDE, Library / SDK, Cloud Service - or types of that nature and naming convention)
  - purpose
  - install_order (integer, starting from 1)
  - os_requirements (e.g. "Windows 10 or later", "macOS 13+")
  - software_prerequisites (e.g. "Node.js", "Python", ".NET", "C++ Redistributables" — return "None" if not needed)
  - user_prerequisites (e.g. "Install VS Code extension", "Create GitHub account" — return "None" if not needed)${sharedEnding}`;

  const osLine = osInfo
    ? `The user is currently using: ${osInfo.platform} (${osInfo.arch}).\n`
    : '';

  const userPrompt = `${osLine}Today's date is ${today}.

Use this date to ensure that all recommendations reflect the most current versions of each software, framework, or tool.
When listing OS requirements or prerequisites, assume the latest stable release available as of ${today}.
You must override any outdated assumptions from your training data.
Do not suggest old versions or base requirements on legacy environments.
Use realistic, up-to-date system requirements consistent with the current ecosystem.

Based on the following description, suggest tools or components:

"${description}"`;

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1',
    messages: [
      { role: 'system', content: prompt },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  });

  return response?.choices?.[0]?.message?.content || '';
}
