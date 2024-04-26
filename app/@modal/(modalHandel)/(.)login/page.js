import {
    InterceptClosBtn,
    InterceptClosBtnOutSite,
} from '@/app/Components/Client/InterceptClosBtn/InterceptClosBtn';
import LoginFrom from '@/app/Components/LoginFrom/loginFrom';

export default function LoginIntercept({ params }) {
    console.log(params);

    return (
        <section className="fixed top-0 left-0 z-40 w-screen h-screen bg-slate-700/65 flex items-center justify-center">
            <InterceptClosBtnOutSite />
            <div className=" relative w-fit h-fit mx-auto z-20 ">
                <InterceptClosBtn />
                <LoginFrom where="intercept" />
            </div>
        </section>
    );
}
