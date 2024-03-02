import PropTypes from 'prop-types';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';

import { useState } from 'react';
import mangroveFish from '../../assets/image/mangrove Fish.png';
import mangroveFish1 from '../../assets/image/mangrove fish2.jpg';
import mangroveHoney1 from '../../assets/image/mangrove honey 1.jpg';
import mangroveHoney from '../../assets/image/mangrove honey.jpg';
import mangrove from '../../assets/image/mangrove picture.jpg';

export default function SliderHero() {
    const [currentIndex, setCurrentIndex] = useState(0);

    const sliderContent = [
        { imgUrl: mangrove, id: 1, name: 'Mangrove Picture' },
        { imgUrl: mangroveFish, id: 2, name: 'Mangrove fish' },
        { imgUrl: mangroveFish1, id: 3, name: 'Mangrove fish 1' },
        { imgUrl: mangroveHoney1, id: 4, name: 'Mangrove honey 1' },
        { imgUrl: mangroveHoney, id: 5, name: 'Mangrove honey ' },
    ];

    const settings = {
        beforeChange: (o, n) => {
            setCurrentIndex(n);
        },

        className: 'h-full w-full overflow-hidden p-0 m-0',
        customPaging: (i) => {
            return (
                <div>
                    <div
                        className={`${
                            currentIndex === i ? 'bg-primaryColor' : 'bg-white'
                        } w-5 h-2 duration-200`}></div>
                </div>
            );
        },
        slickGoTo: (a) => {
            console.log(a);
        },
        dots: true,
        infinite: true,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: true,
        speed: 500,
        autoplaySpeed: 5000,
        focusOnSelect: true,
        dotsClass: 'slick-dots xl:mb-14 md:mb-10 mb-10',
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
                <img
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
    console.log(style);

    return (
        <div
            className={`${className} right-16 z-10 scale-[1.8] group-hover:scale-[2.2] duration-300`}
            style={{
                ...style,
                display: 'block',
            }}
            onClick={onClick}
        />
    );
}

function SamplePrevArrow(props) {
    const { className, style, onClick } = props;
    return (
        <div
            className={`${className}  left-16 z-10 scale-[1.8] group-hover:scale-[2.2] duration-300`}
            style={{ ...style, display: 'block' }}
            onClick={onClick}>
            next
        </div>
    );
}

CustomSlide.propTypes = { slidItem: PropTypes.object };
SamplePrevArrow.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
};
SampleNextArrow.propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    onClick: PropTypes.func,
};
