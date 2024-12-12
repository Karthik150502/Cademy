import { redirect } from "next/navigation";
import WatchPageImpl from "./page.client";
import { Env } from "@/lib/config";

interface PageProps {
    params: {
        roomId: string;
    };
}

export default async function WatchPage({ params: { roomId } }: PageProps) {
    if (!roomId) {
        redirect("/");
    }

    const serverUrl = Env.liveKitWsUrl.replace("wss://", "https://")
        .replace("ws://", "http://");

    return <WatchPageImpl roomId={roomId} serverUrl={serverUrl} />;
}
