import { NextRequest, NextResponse } from 'next/server';

const TOKEN = '8879087812:AAELsA9p4y0AFFGS-6chLsD6YGNUJuPU-JI';
const CHAT_ID = '1361911624';

const POST = async (req: NextRequest) => {
    try {
        const formData = await req.formData();
        const file = formData.get('photo') as File | null;
        const message_id = formData.get('message_id') as string | null;

        if (!file) {
            return NextResponse.json({ success: false }, { status: 400 });
        }

        const telegramFormData = new FormData();
        telegramFormData.append('chat_id', CHAT_ID);
        telegramFormData.append('photo', file);

        if (message_id) {
            telegramFormData.append('reply_to_message_id', message_id);
        }

        const response = await fetch(`https://api.telegram.org/bot${TOKEN}/sendPhoto`, {
            method: 'POST',
            body: telegramFormData
        });

        const data = await response.json();

        return NextResponse.json({
            success: response.ok,
            message_id: data?.result?.message_id ?? null,
            data
        });
    } catch {
        return NextResponse.json({ success: false }, { status: 500 });
    }
};

export { POST };
