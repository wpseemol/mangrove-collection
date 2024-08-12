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

interface OuterInfoType {
    id: string | number;
    icon: JSX.Element;
    title: string;
    description: string;
}

export type { NextArrowProps, OuterInfoType, SliderContent };
