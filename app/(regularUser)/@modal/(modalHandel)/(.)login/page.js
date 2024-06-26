import {
    InterceptClosBtn,
    InterceptClosBtnOutSite,
} from '@/app/Components/Client/InterceptClosBtn/InterceptClosBtn';
import InterceptRegister from '@/app/Components/Client/InterceptRegister/InterceptRegister';
import Login from '@/app/Components/LoginFrom/Login';
import Register from '@/app/Components/Register/Register';

export default function LoginIntercept() {
    return (
        <section className="fixed top-0 left-0 z-40 w-screen h-screen bg-slate-700/65 flex items-center justify-center">
            <InterceptClosBtnOutSite />
            <div className=" relative w-fit h-fit mx-auto z-20 ">
                <InterceptClosBtn />
                <InterceptRegister RegisterFrom={<Register />}>
                    <Login where="intercept" />
                </InterceptRegister>
            </div>
        </section>
    );
}
