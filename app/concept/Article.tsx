"use client";

import Image from "next/image";
import { useEffect } from "react";
import weather from "@/public/assets/Images/weather.jpg";
import { PAGE, SELECTION } from "./data";
import { useEcho } from "./store";

export default function Article() {
  const { scenario } = useEcho();

  useEffect(() => {
    if (scenario !== "selection") return;
    document.getElementById("echo-claim")?.scrollIntoView({ block: "center" });
  }, [scenario]);

  return (
    <article className="min-h-0 flex-1 overflow-y-auto bg-[var(--paper)]">
      <div className="mx-auto max-w-[640px] px-6 py-8 sm:px-10">
        <p className="font-sans text-[11px] tracking-[0.16em] text-[var(--paper-muted)] uppercase">
          {PAGE.kicker} · {PAGE.site}
        </p>
        <h1
          className="mt-3 text-[34px] leading-[1.12] font-semibold tracking-tight text-[var(--paper-head)]"
          style={{ fontFamily: "Georgia, 'Iowan Old Style', Palatino, serif" }}
        >
          {PAGE.title}
        </h1>
        <p className="mt-3 text-[15px] leading-6 text-[var(--paper-dek)]">
          From Medellín to Phoenix, planners are treating shade as something a city builds, not
          something it hopes for.
        </p>
        <p className="mt-3 font-sans text-[12px] text-[var(--paper-muted)]">
          The cities desk · {PAGE.date} · {PAGE.read}
        </p>

        <figure className="mt-6">
          <Image
            src={weather}
            alt="Aerial view of Medellín at sunset: tree canopy in the valley, dense neighborhoods climbing the hillsides"
            placeholder="blur"
            sizes="(min-width: 700px) 592px, 100vw"
            className="h-56 w-full rounded-xl object-cover"
          />
          <figcaption className="mt-2 font-sans text-[12px] text-[var(--paper-muted)]">
            Medellín from the hills: canopy follows the valley floor, while the densest blocks climb
            the slopes where shade is scarcest.
          </figcaption>
        </figure>

        <div
          className="mt-6 space-y-4 text-[17px] leading-[1.55] text-[var(--paper-text)]"
          style={{ fontFamily: "Georgia, 'Iowan Old Style', Palatino, serif" }}
        >
          <p>
            Cities have spent a decade treating heat as a forecast. The planners who are actually
            cooling streets treat it as a design problem.
          </p>
          <p>
            Medellín’s green corridors — trees along 30 roads and streams — dropped temperatures in
            those neighborhoods by about 2°C. The cost was modest next to a new train line, and the
            shade arrived on foot.
          </p>
          <p>
            Phoenix mapped the walks people already take: to school, to the bus, to a shift that
            starts at 2 p.m. The hottest blocks get trees first. “We stopped planting where it
            looked good in a rendering,” a city arborist says.
          </p>
          <div id="echo-claim" className="scroll-mt-6">
            <p>
              The claim that keeps showing up in the research:{" "}
              {scenario === "selection" ? (
                <mark className="rounded bg-[var(--paper-mark)] px-0.5 text-inherit">{SELECTION}</mark>
              ) : (
                SELECTION
              )}
              . Air temperature barely moves. Skin, asphalt, and bus stops do.
            </p>
          </div>
          <p>
            None of this is a substitute for cutting emissions. It is what you can finish before
            next summer.
          </p>
        </div>
      </div>
    </article>
  );
}
