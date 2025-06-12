"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import Image from 'next/image';
import { useEffect, useRef } from 'react';


const HeroSection = () => {
const imageRef = useRef(null);

useEffect(() =>{
    const imageElement = imageRef.current;

    const handleScroll = () => {
    const scrollPosition = window.scrollY;
    const scrollThreshold = 100;

    if (scrollPosition > scrollThreshold){

        imageElement.classList.add('scrolled');
    }else{
        imageElement.classList.remove('scrolled');
        }
    };
window.addEventListener("scroll", handleScroll);
}, []);


  return (
    <section className='w-full pt-36 md:pt-48 pb-10 '>
        <div className='space-y-6 text-center'>
            <div className='space-y-6 mx-auto'>
                <h1 className=' text-5xl font-bold md:text-6xl lg:text-7xl xl:text-8xl'>Your AI Career Coach for
                    <br />
                    Professional Success
                </h1>
                <p className='mx-auto max-w-[600px] text-muted-foreground md:text-x1'>
                    Unlock your potential with personalized AI-driven career guidance, resume building, and interview preparation.
                </p>
                </div>
                <div>
                    <Link href="/dashboard">
                    <Button size="lg" className="px-8">
                    Get Started
                    </Button>
                    </Link>
                    <Link href="https:startupai.vercel.app/">
                    <Button size="lg" className="px-8" variant="outline">
                    Get Started
                    </Button>
                    </Link>
                </div>
                <div className='hero-image-wrapper mt-5 md:mt-0'>
                    <div ref={imageRef} className='hero-image'>
                        <Image
                            src={"/banner.png"}
                            alt="banner"
                            width={1200}
                            height={720}
                            className="rounded-lg shadow-2xl border mx-auto"
                            priority
                            />
                         </div>
                </div>
        </div>
    </section>
  );
};

export default HeroSection;
