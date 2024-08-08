import Image from 'next/image';
import loadingImage from '/public/assets/logo/loading-spinner.gif';

export default function LoadingComponent({ type }) {
    switch (type) {
        case 'full-screen':
            return (
                <section className="w-full h-[calc(100vh-22rem)] flex items-center overflow-hidden  justify-center">
                    <figure className="">
                        <Image
                            src={loadingImage}
                            alt="loading-image"
                            className=""
                            width={50}
                            height={50}
                            unoptimized
                        />
                    </figure>
                </section>
            );

        default:
            return (
                <>
                    <section className="w-full h-screen flex items-center overflow-hidden fixed justify-center top-0 left-0 z-[100] bg-[#f4f5f6] ">
                        <figure className="">
                            <Image
                                src={loadingImage}
                                alt="loading-image"
                                className=""
                                width={50}
                                height={50}
                                unoptimized
                            />
                        </figure>
                    </section>
                </>
            );
    }
}
