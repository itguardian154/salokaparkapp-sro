import axios from "axios";
import { useCallback, useState } from "react";
import { updateMasterSegment } from "../service/master-segment-service";
import type { UpdateSegmentPayload } from "../types/master-segment";

type UpdateSegmentErrorResponse = {
    message?: string;
    errors?: Record<string, string | string[]>;
};

const getUpdateSegmentErrorMessage = (error: unknown) => {
    if (axios.isAxiosError<UpdateSegmentErrorResponse>(error)) {
        const response = error.response?.data;

        const validationErrors = Object.values(
            response?.errors ?? {},
        ).flatMap((messages) =>
            Array.isArray(messages) ? messages : [messages],
        );

        if (validationErrors.length > 0) {
            return `${response?.message ?? "Validasi gagal."} ${validationErrors.join(" ")}`;
        }

        if (response?.message) return response.message;
    }

    return error instanceof Error
        ? error.message
        : "Gagal memperbarui data segment.";
};

const useEditSegment = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const submit = async (
        id: number,
        payload: UpdateSegmentPayload,
    ) => {
        setLoading(true);
        setError(null);

        try {
            await updateMasterSegment(id, payload);
        } catch (err: unknown) {
            const message = getUpdateSegmentErrorMessage(err);
            setError(message);
            throw new Error(message);
        } finally {
            setLoading(false);
        }
    };

    const clearError = useCallback(() => setError(null), []);

    return { submit, loading, error, clearError };
};

export default useEditSegment;