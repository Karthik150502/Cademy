"use client"
import axios from "axios";
import { useEffect, useState } from "react";

export default function useFetch({
    url
}: {
    url: string
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isError, setIsError] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState({});

    useEffect(() => {
        setIsLoading(true);
        setIsError(false);
        setError(null);
        setData({});
        axios.get(url).then(res => {
            setData(res.data);
        }).catch((error) => {
            setIsError(true);
            if (error instanceof Error) {
                setError(error);
            }
        }).finally(() => {
            setIsLoading(false);
        })
    }, [url])


    return {
        data, isLoading, isError, error
    }
}
