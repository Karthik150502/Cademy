import { redirect } from "next/navigation";
import HostPageImpl from "./page.client";
import { Env } from "@/lib/config";

interface PageProps {
  searchParams: {
    at: string | undefined;
    rt: string | undefined;
    roomId: string | undefined

  };
}

export default async function HostPage({
  searchParams: { at, rt, roomId },
}: PageProps) {
  if (!at || !rt || !roomId) {
    redirect("/");
  }

  const serverUrl = Env.liveKitWsUrl.replace("wss://", "https://")
    .replace("ws://", "http://");
  return <HostPageImpl roomId={roomId} authToken={at} roomToken={rt} serverUrl={serverUrl} />;
}
