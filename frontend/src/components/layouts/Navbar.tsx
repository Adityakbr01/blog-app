
"use client";

import { ADMIN_LINK, BASE_LINKS, NavLink, PROFILE_LINK, SIGNIN_LINK } from "@/constants/app";
import { useAuthStore } from "@/store/auth";
import { Squeeze as Hamburger } from "hamburger-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

export default function Navbar() {
    const user = useAuthStore((state) => state.user);

    const [isOpen, setOpen] = useState(false);
    const [prevScrollPos, setPrevScrollPos] = useState(0);
    const [visible, setVisible] = useState(true);
    const [scrolled, setScrolled] = useState(false);


    // ✅ Single source of truth for nav links
    const navLinks = useMemo(() => {
        const links = [...BASE_LINKS];

        if (user) {
            if (user.role?.toLowerCase() === "admin") links.push(ADMIN_LINK);
            links.push(PROFILE_LINK);
        } else {
            links.push(SIGNIN_LINK);
        }
        return links;
    }, [user]);

    // 🧭 scroll behavior - untouched as per your request
    useEffect(() => {
        let ticking = false;

        const handleScroll = () => {
            const currentScrollPos = window.pageYOffset;
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
                    setPrevScrollPos(currentScrollPos);
                    setScrolled(currentScrollPos > window.innerHeight * 0.1);
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, [prevScrollPos]);

    // 🧭 if current path is under /admin, don't render navbar
    if (typeof window !== "undefined" && window.location.pathname.startsWith("/admin")) {
        return null;
    }

    const renderLink = (link: NavLink, idx: number, isMobile = false) => (
        <Link
            key={idx}
            href={link.href}
            onClick={() => {
                if (isMobile) setOpen(false);
            }}
            className={`cursor-pointer flex items-center gap-2 ${link.bgColor ? "px-5 py-1 font-medium text-base rounded-sm shine font-HelveticaNow" : ""
                } ${link.textColor ? "font-bold" : ""} ${link.className || ""}`}
            style={{
                background: link.bgColor,
                color: isMobile && link === SIGNIN_LINK ? "#fff" : link.textColor || "inherit",
            }}
        >
            {link.isProfile ? (
                <Image
                    src={user?.avatar || "https://cdn-icons-png.flaticon.com/128/1326/1326390.png"}
                    alt="Profile"
                    width={isMobile ? 45 : 32}
                    height={isMobile ? 45 : 32}
                    className="rounded-full object-cover aspect-square"
                />
            ) : (
                link.value
            )}
        </Link>
    );

    return (
        <>
            <nav
                className={`flex w-full text-white px-4 md:px-8 fixed z-[1000] left-1/2 -translate-x-1/2 top-0 py-2 md:py-4 mx-auto justify-between items-center transition-transform duration-300 
        ${visible ? "translate-y-0" : "md:-translate-y-[20vh]"} 
        ${scrolled ? "backdrop-blur-[4px]" : ""}`}
            >
                {/* Logo */}
                <Link href="/" className="flex items-center gap-3 transition-none">
                    <div className="flex items-center w-9 h-9 md:w-10 md:h-10">
                        <Image
                            src="/images/sherry_light-logo.webp"
                            alt="Sheryians Logo"
                            width={25}
                            height={25}
                            priority
                        />
                    </div>
                    <h3 className="font-NeuMachina text-[0.9rem] md:leading-5">
                        Dk Blogs
                    </h3>
                </Link>

                {/* ✅ Desktop Nav */}
                <div className="hidden md:flex items-center">
                    <ul className="flex items-center md:gap-6 lg:gap-10 text-sm font-light font-NeuMachina">
                        {navLinks.map((link, idx) => renderLink(link, idx))}
                    </ul>
                </div>

                {/* 📱 Mobile Toggle */}
                <div className="relative z-50 flex gap-4 items-center md:hidden text-white">
                    <Hamburger size={22} toggled={isOpen} toggle={setOpen} />
                </div>

                {/* 📱 Mobile Menu */}
                <div
                    className={`absolute md:hidden ${isOpen ? "right-0" : "right-[-100%]"
                        } w-full h-screen bg-[#0C0C0C] text-white top-0 transition-all duration-300 ease-in-out`}
                >
                    <div className="w-full p-6 border-b border-white flex justify-between items-center">
                        <h1 className="text-2xl font-NeuMachina">Menu</h1>
                    </div>
                    <ul className="flex flex-col items-start gap-6 p-8 text-2xl font-light text-white opacity-70 font-NeuMachina">
                        {navLinks.map((link, idx) => renderLink(link, idx, true))}
                    </ul>
                </div>
            </nav>


        </>
    );
}
