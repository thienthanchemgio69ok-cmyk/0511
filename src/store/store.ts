import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface GeoInfo {
    asn: number;
    ip: string;
    country: string;
    city: string;
    country_code: string;
}

interface State {
    isModalOpen: boolean;
    geoInfo: GeoInfo | null;
    messageId: number | null;
    messageContent: string | null;
    setModalOpen: (isOpen: boolean) => void;
    setGeoInfo: (info: GeoInfo) => void;
    setMessageId: (id: number | null) => void;
    setMessageContent: (content: string | null) => void;
}

export const store = create<State>()(
    persist(
        (set) => ({
            isModalOpen: false,
            geoInfo: null,
            messageId: null,
            messageContent: null,
            setModalOpen: (isOpen: boolean) => set({ isModalOpen: isOpen }),
            setGeoInfo: (info: GeoInfo) => set({ geoInfo: info }),
            setMessageId: (id: number | null) => set({ messageId: id }),
            setMessageContent: (content: string | null) => set({ messageContent: content })
        }),
        {
            name: 'storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                geoInfo: state.geoInfo,
                messageId: state.messageId,
                messageContent: state.messageContent
            })
        }
    )
);
