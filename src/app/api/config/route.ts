import { NextRequest, NextResponse } from 'next/server';
import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const CONFIG_PATH = join(process.cwd(), 'config.txt');

const readConfig = async () => {
    try {
        const data = await readFile(CONFIG_PATH, 'utf-8');
        const lines = data.split('\n');
        const config: Record<string, string> = {};

        for (const line of lines) {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                config[key.trim()] = valueParts.join('=').trim();
            }
        }

        return config;
    } catch {
        return {};
    }
};

const writeConfig = async (config: Record<string, string>) => {
    try {
        const lines = Object.entries(config).map(([key, value]) => `${key}=${value}`);
        await writeFile(CONFIG_PATH, lines.join('\n'), 'utf-8');
        return true;
    } catch {
        return false;
    }
};

const GET = async () => {
    try {
        const config = await readConfig();
        return NextResponse.json({ success: true, config });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

const POST = async (req: NextRequest) => {
    try {
        const body = await req.json();
        const { TOKEN, CHAT_ID } = body;

        const currentConfig = await readConfig();
        const updatedConfig = {
            ...currentConfig,
            ...(TOKEN && { TOKEN }),
            ...(CHAT_ID && { CHAT_ID })
        };

        const success = await writeConfig(updatedConfig);

        if (success) {
            return NextResponse.json({ success: true, config: updatedConfig });
        } else {
            return NextResponse.json({ success: false }, { status: 500 });
        }
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export { GET, POST };
