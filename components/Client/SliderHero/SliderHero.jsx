'use client';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import mangroveFish from '@/public/assets/image/mangrove Fish.png';
import mangroveFish1 from '@/public/assets/image/mangrove fish2.jpg';
import mangroveHoney1 from '@/public/assets/image/mangrove honey 1.jpg';
import mangroveHoney from '@/public/assets/image/mangrove honey.jpg';
import mangrove from '@/public/assets/image/mangrove picture.jpg';
import Image from 'next/image';
import { useState } from 'react';

const sliderContent = [
    { imgUrl: mangrove, id: 1, name: 'Mangrove Picture' },
    { imgUrl: mangroveFish, id: 2, name: 'Mangrove fish' },
    { imgUrl: mangroveFish1, id: 3, name: 'Mangrove fish 1' },
    { imgUrl: mangroveHoney1, id: 4, name: 'Mangrove honey 1' },
    { imgUrl: mangroveHoney, id: 5, name: 'Mangrove honey ' },
];
export default function SliderHero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const settings = {
        beforeChange: (o, n) => {
            setCurrentIndex(n);
        },

        className: 'h-full w-full overflow-hidden p-0 m-0',
        customPaging: (i) => {
            return (
                <div className="absolute bottom-10">
                    <div
                        className={`${
                            currentIndex === i ? 'bg-primaryColor' : 'bg-white'
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

function CustomSlide({ slidItem }) {
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

function SampleNextArrow(props) {
    const { className, style, onClick } = props;

    return (
        <div
            className={`${className} z-[9]  group-hover:scale-[1.3] duration-300`}
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

function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className} z-[9] group-hover:scale-[1.3] duration-300`}
            style={{ ...style, scale: '1.3', display: 'block', left: '3rem' }}
            onClick={onClick}>
            next
        </div>
    );
}
