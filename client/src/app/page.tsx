import AllRooms from "@/components/app/allRooms";
import Header from "@/components/app/header";

export default function Home() {
  return (
    <div className="min-h-screen overflow-hidden relative flex flex-col items-center justify-start pt-[100px]">
      <Header />
      <AllRooms />
    </div>
  );
}
