interface SliderContent {
    imgUrl: string | StaticImageData;
    id: string;
    name: string;
}

interface NextArrowProps {
    className?: string;
    style?: React.CSSProperties;
    onClick?: () => void;
}

export type { NextArrowProps, SliderContent };
