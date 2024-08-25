/**
 * The `SliderContent` interface defines the structure for the content of a slider component.
 * - `imgUrl`: A URL string or a `StaticImageData` object representing the image to be displayed.
 * - `id`: A unique identifier for the slider item, typically a string.
 * - `name`: The name or label associated with the slider content.
 */
export interface SliderContent {
    imgUrl: string | StaticImageData; // URL of the image or StaticImageData object.
    id: string; // Unique identifier for each slider item.
    name: string; // Name or label for the slider content.
}

/**
 * The `NextArrowProps` interface defines the properties for the next arrow button in a slider or carousel component.
 * - `className`: An optional CSS class name to style the arrow.
 * - `style`: Optional inline CSS styles applied to the arrow element.
 * - `onClick`: An optional click handler function that triggers when the arrow is clicked.
 */
export interface NextArrowProps {
    className?: string; // Optional CSS class for styling the arrow.
    style?: React.CSSProperties; // Optional inline styles for the arrow element.
    onClick?: () => void; // Optional function triggered on arrow click.
}

/**
 * The `OuterInfoType` interface defines the structure for displaying additional information, possibly outside of a main component.
 * - `id`: A unique identifier, which can be either a string or a number.
 * - `icon`: A JSX element representing an icon associated with the information.
 * - `title`: The title or heading for the information section.
 * - `description`: A brief description or details about the information.
 */
export interface OuterInfoType {
    id: string | number; // Unique identifier for the information, either a string or number.
    icon: JSX.Element; // JSX element representing the icon.
    title: string; // Title or heading for the information.
    description: string; // Description or details about the information.
}
