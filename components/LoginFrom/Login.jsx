import LoginForm from '../Client/LoginForm/LoginForm';

export default function Login(where) {
    return (
        <div className="flex flex-col p-5 rounded-md border border-neutral-600/10 sm:p-10 bg-white text-gray-800 shadow hover:shrink-lg duration-100">
            <div className="mb-8 text-center">
                <h1 className="my-3 md:text-3xl text-2xl font-bold">Sign in</h1>
                <p className="text-sm text-gray-600">
                    Sign in to access your account
                </p>
            </div>
            <LoginForm />
        </div>
    );
}
