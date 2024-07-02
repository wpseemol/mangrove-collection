import Image from 'next/image';
import loginIcon from '/public/assets/logo/loading-spinner.gif';

export default function LoadingComponent({ type }) {
    if ('fullPage' === type) {
        return (
            <section>
                <figure>
                    <Image src={loginIcon} alt="loading-icon" />
                </figure>
            </section>
        );
    }
}
