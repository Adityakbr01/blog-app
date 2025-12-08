import Image from 'next/image'
import Link from 'next/link'

function Section_04() {
    return (
        <section className="flex flex-col items-center justify-center text-white py-16 px-4 bg-transparent w-full text-center gap-10">
            {/* Heading */}
            <h1 className="font-NeuMachina text-2xl md:text-5xl leading-tight">
                Top <span className="text-[var(--custom-primary)]">companies</span> our students <br /> work with
            </h1>

            {/* Company Logos */}
            <Image
                src="/images/companies_logos.webp"
                alt="Logos of top companies our students work with"
                width={1200}
                height={300}
                className="object-contain mx-auto max-w-full"
                priority
            />

            {/* Button */}
            <Link
                href="/courses"
                className="bg-[var(--custom-primary)] hidden md:flex text-black font-HelveticaNow font-medium px-8 py-2 cursor-pointer text-2xl rounded-md transition-all duration-300"
            >
                Explore Courses
            </Link>
        </section>
    )
}

export default Section_04
