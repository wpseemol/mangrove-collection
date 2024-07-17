const imageUrl64bit = (selectedId, file, setStateFun) => {
    const render = new FileReader();
    render.readAsDataURL(file);
    render.onloadend = () => {
        setStateFun((pre) => {
            const updatedImageUpload = pre.map((element) => {
                if (element.id === selectedId) {
                    return {
                        ...element,
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

export { imageUrl64bit };
