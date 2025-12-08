"use client";

import { Button } from "@/components/ui/button";
import React from "react";

function Section_2() {
  return (
    <section className="flex flex-col bg-transparent text-white items-center justify-center flex-1 px-4 md:px-16 py-16 gap-10 md:gap-16 text-center">

      {/* Top Heading */}
      <div className="top lg:w-4xl">
        <h1 className="text-xl sm:text-xl md:text-5xl font-NeuMachina leading-snug md:leading-12">
          We do whatever it takes to help you{" "}
          <span className="text-[var(--custom-primary)]">
            understand the concepts
          </span>
        </h1>
      </div>

      {/* Middle Video Placeholder */}
      <div className="middle w-full flex justify-center">
        <div className="video-container w-full md:w-[100%] lg:w-[74%] rounded-2xl overflow-hidden aspect-video relative">
          <iframe
            className="absolute top-0 left-0 w-full h-full"
            src="https://www.youtube-nocookie.com/embed/60SRAWmMXyc"
            title="YouTube video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </div>


      {/* Button */}
      <div className="button">
        <Button className="bg-[var(--custom-primary)] hover:bg-[var(--custom-primary)] cursor-pointery text-black font-HelveticaNow px-6 py-3 md:px-8 md:py-4 rounded-md text-sm md:text-lg">
          Explore Free Learning
        </Button>
      </div>

    </section>
  );
}

export default Section_2;
