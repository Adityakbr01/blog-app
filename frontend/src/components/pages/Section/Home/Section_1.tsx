
import { Button } from '@/components/ui/button'
import React from 'react'
import CountUp from 'react-countup'

function Section_1() {
    return (
        <section className="section_1 flex flex-col items-center justify-center gap-6 text-white min-h-screen px-4">
            <div className="top pt-16 md:pt-9 hidden lg:block"></div>
            <div className="relative flex flex-col items-center gap-6 md:justify-center middle">
                <h1 className="text-4xl sm:text-5xl md:text-[5.1rem] relative md:leading-[4.5rem] font-extralight font-NeuMachina text-center">
                    We only <span className="text-[var(--custom-primary)]">teach</span> <br />
                    what we are really <br />
                    really <span className="font-juana">good </span>
                    at.
                    <div className="mt-6 lg:mt-0 hidden lg:absolute lg:-right-40 lg:-bottom-[3.9rem] lg:flex justify-center gap-6">
                        <div className="w-full max-w-[14rem] p-4">
                            <p className="text-sm lg:text-[0.9rem] text-start font-extralight font-HelveticaNow leading-4">
                                Get ready to
                                <span className="text-[var(--custom-primary)]"> accelerate your career </span>
                                with customized courses and leave your mark in the tech industry
                            </p>
                        </div>
                    </div>
                </h1>
                <Button className="px-4 py-4 md:px-6 md:py-6 font-HelveticaNow text-black bg-[var(--custom-primary)] hover:bg-[#1bd1a6] text-sm md:text-xl font-medium rounded-md">
                    Check Courses – Make an Impact
                </Button>
            </div>
            <div className="bottom mt-12 md:mt-20 flex">
                <div className="flex flex-co sm:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-12 lg:gap-24 font-HelveticaNow">
                    <h2 className="flex flex-col items-center justify-center text-center gap-2">
                        <span className="text-lg sm:text-2xl md:text-4xl font-semibold font-Helvetica">
                            <CountUp
                                start={0}
                                end={25}
                                duration={2.75}
                                separator=","
                                suffix="k+"
                                aria-live="polite"
                            />
                        </span>
                        <span className="text-xs sm:text-sm md:text-xl font-NeuMachina">Students Taught</span>
                    </h2>
                    <h2 className="flex flex-col items-center justify-center text-center gap-2">
                        <span className="text-lg sm:text-2xl md:text-4xl font-semibold font-Helvetica">
                            <CountUp
                                start={0}
                                end={20}
                                duration={2.75}
                                separator=","
                                suffix="k+"
                                aria-live="polite"
                            />
                        </span>
                        <span className="text-xs sm:text-sm md:text-xl font-NeuMachina">Instructors</span>
                    </h2>
                    <h2 className="flex flex-col items-center justify-center text-center gap-2">
                        <span className="text-lg sm:text-2xl md:text-4xl font-semibold font-Helvetica">
                            <CountUp
                                start={0}
                                end={578}
                                duration={4.75}
                                separator=","
                                suffix="k+"
                                aria-live="polite"
                            />
                        </span>
                        <span className="text-xs sm:text-sm md:text-xl font-NeuMachina">YouTube Subs.</span>
                    </h2>
                </div>
            </div>
        </section>
    )
}

export default Section_1