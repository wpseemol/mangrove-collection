const imageUrlBase64 = (selectedId, file, setStateFun) => {
    const render = new FileReader();
    render.readAsDataURL(file);
    render.onloadend = () => {
        setStateFun((pre) => {
            const updatedImageUpload = pre.map((element) => {
                if (element.id === selectedId) {
                    return {
                        ...element,
                        file,
                        imgUrl: render.result,
                    };
                } else {
                    return element;
                }
            });

            return updatedImageUpload;
        });
    };
};

const convertFileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            resolve({
                id: crypto.randomUUID(),
                file,
                imgUrl: reader.result,
            });
        };
        reader.onerror = reject;
    });
};

export { convertFileToBase64, imageUrlBase64 };
