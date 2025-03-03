'use client'
import Image from "next/image";
import { MyMap } from "../components/Map/MyMap";

export default function Home() {
  return (
    <div className="mt-5 items-center justify-center flex flex-col">
        <MyMap/>
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  );
}
