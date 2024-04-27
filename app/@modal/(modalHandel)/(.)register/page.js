import {
    InterceptClosBtn,
    InterceptClosBtnOutSite,
} from '@/app/Components/Client/InterceptClosBtn/InterceptClosBtn';
import InterceptRegister from '@/app/Components/Client/InterceptRegister/InterceptRegister';
import LoginFrom from '@/app/Components/LoginFrom/LoginFrom';
import RegisterFrom from '@/app/Components/RegisterFrom/RegisterFrom';

export default function RegisterIntercept() {
    return (
        <section className="fixed top-0 left-0 z-40 w-screen h-screen bg-slate-700/65 flex items-center justify-center">
            <InterceptClosBtnOutSite />
            <div className=" relative w-fit h-fit mx-auto z-20 ">
                <InterceptClosBtn />
                <InterceptRegister RegisterFrom={<RegisterFrom />}>
                    <LoginFrom where="intercept" />
                    <p>this is register</p>
                </InterceptRegister>
            </div>
        </section>
    );
}
