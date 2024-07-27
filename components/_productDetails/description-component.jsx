export default function DescriptionComponent({ description }) {
    return (
        <div
            className="quill-content"
            dangerouslySetInnerHTML={{
                __html: description,
            }}
        />
    );
}
