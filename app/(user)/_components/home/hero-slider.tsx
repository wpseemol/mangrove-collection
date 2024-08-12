'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import mangroveFish from '@/public/assets/image/mangrove Fish.png';
import mangroveFish1 from '@/public/assets/image/mangrove fish2.jpg';
import mangroveHoney1 from '@/public/assets/image/mangrove honey 1.jpg';
import mangroveHoney from '@/public/assets/image/mangrove honey.jpg';
import mangrove from '@/public/assets/image/mangrove picture.jpg';
import { NextArrowProps, SliderContent } from '@/types/home';
import Image from 'next/image';
import { useState } from 'react';

const sliderContent: SliderContent[] = [
    { imgUrl: mangrove, id: crypto.randomUUID(), name: 'Mangrove Picture' },
    { imgUrl: mangroveFish, id: crypto.randomUUID(), name: 'Mangrove fish' },
    { imgUrl: mangroveFish1, id: crypto.randomUUID(), name: 'Mangrove fish 1' },
    {
        imgUrl: mangroveHoney1,
        id: crypto.randomUUID(),
        name: 'Mangrove honey 1',
    },
    { imgUrl: mangroveHoney, id: crypto.randomUUID(), name: 'Mangrove honey ' },
];
export default function HeroSlider() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const settings = {
        beforeChange: (oldIndex: number, newIndex: number) => {
            setCurrentIndex(newIndex);
        },

        className: 'h-full w-full overflow-hidden p-0 m-0',
        customPaging: (i: number) => {
            return (
                <div className="absolute bottom-10">
                    <div
                        className={`${
                            currentIndex === i
                                ? 'bg-primary-foreground'
                                : 'bg-white'
                        } w-5 h-2 duration-200`}></div>
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
        <div className="slider-container w-full h-full group">
            <Slider {...settings}>
                {sliderContent.map((slidItem) => (
                    <CustomSlide key={slidItem.id} slidItem={slidItem} />
                ))}
            </Slider>
        </div>
    );
}

function CustomSlide({ slidItem }: { slidItem: SliderContent }) {
    return (
        <div>
            <figure className="w-full h-full ">
                <Image
                    className="w-full 2xl:h-[45rem] xl:h-[36rem] lg:h-[29rem] md:h-[22rem] sm:h-[18rem] h-[15rem] object-cover object-center"
                    src={slidItem.imgUrl}
                    alt={slidItem.name}
                />
            </figure>
        </div>
    );
}

function SampleNextArrow({ className, style, onClick }: NextArrowProps) {
    return (
        <div
            className={`${className} z-[9]  scale-[1.3] duration-300`}
            style={{
                ...style,
                scale: '1.3',
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
            className={`${className} z-[9] scale-[1.3] duration-300`}
            style={{ ...style, scale: '1.3', display: 'block', left: '3rem' }}
            onClick={onClick}>
            next
        </div>
    );
}
