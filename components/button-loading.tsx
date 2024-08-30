import { FcSynchronize } from 'react-icons/fc';

export default function ButtonLoading() {
    return (
        <>
            ...
            <span className="ml-2">
                <FcSynchronize className="text-xl animate-spin" />
            </span>
        </>
    );
}
