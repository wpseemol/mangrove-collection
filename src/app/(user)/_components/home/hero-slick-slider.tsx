'use client';

import { sliderContent } from '@/db/home/sliderContent';
import { SliderContent } from '@/types/home';
import { motion, useScroll, useTransform } from 'framer-motion';
import Image from 'next/image';
import { useState } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

export default function HeroSlickSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const settings = {
        beforeChange: (oldIndex: number, newIndex: number) => {
            setCurrentIndex(newIndex);
        },

        className: 'h-full w-full overflow-hidden p-0 m-0 gap-1',
        customPaging: (i: number) => {
            return (
                <div className="absolute md:bottom-10 bottom-8 ">
                    <div
                        className={`${
                            currentIndex === i
                                ? 'bg-primary-foreground'
                                : 'bg-white/90'
                        } md:w-5 md:h-2 w-3 h-1 duration-200`}></div>
                </div>
            );
        },

        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        speed: 500,
        autoplaySpeed: 5000,
        focusOnSelect: true,
        dotsClass: 'slick-dots xl:mb-[10rem] md:mb-10 mb-10',
        centerPadding: '200px',

        nextArrow: <SampleNextArrow />,
        prevArrow: <SamplePrevArrow />,
    };

    return (
        <div className="slider-container md:w-full h-full ">
            <Slider {...settings}>
                {sliderContent.map((slidItem) => (
                    <CustomSlide key={slidItem.id} slidItem={slidItem} />
                ))}
            </Slider>
        </div>
    );
}

function CustomSlide({ slidItem }: { slidItem: SliderContent }) {
    const { scrollY } = useScroll();
    const scale = useTransform(scrollY, [0, 750], [1, 2]);
    return (
        <>
            <figure className="w-full h-full overflow-hidden flex justify-center items-center bg-secondary">
                <motion.span
                    style={{ scale }}
                    initial={{ scale: 1.5 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 0.3,
                        duration: 0.8,
                        type: 'keyframes',
                        stiffness: 50,
                    }}
                    className="w-full h-full">
                    <Image
                        className="object-cover object-center w-full 2xl:h-[515px] lg:h-[450px]"
                        src={slidItem.imgUrl}
                        alt={slidItem.name}
                        width={965}
                        height={514}
                    />
                </motion.span>
            </figure>
        </>
    );
}

function SampleNextArrow({ className, style, onClick }: NextArrowProps) {
    return (
        <div
            className={`${className}  z-[9]  duration-300 md:opacity-100 md:scale-[1.6] opacity-0 scale-0`}
            style={{
                ...style,
                scale: '1.6',
                display: 'block',
                right: '3rem',
            }}
            onClick={onClick}
        />
    );
}

function SamplePrevArrow({ className, style, onClick }: NextArrowProps) {
    return (
        <div
            className={`${className} z-[9]  duration-300 md:opacity-100 md:scale-[1.6] opacity-0 scale-0`}
            style={{ ...style, scale: '1.6', display: 'block', left: '3rem' }}
            onClick={onClick}>
            next
        </div>
    );
}

/**
 * The `NextArrowProps` interface defines the properties for the next arrow button in a slider or carousel component.
 * - `className`: An optional CSS class name to style the arrow.
 * - `style`: Optional inline CSS styles applied to the arrow element.
 * - `onClick`: An optional click handler function that triggers when the arrow is clicked.
 */
export interface NextArrowProps {
    /**
     * Optional CSS class for styling the arrow.
     */
    className?: string;

    /**
     * Optional inline styles for the arrow element.
     */
    style?: React.CSSProperties;

    /**
     * Optional function triggered on arrow click.
     */
    onClick?: () => void; //
}
