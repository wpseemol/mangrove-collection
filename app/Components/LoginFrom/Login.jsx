import LoginForm from '../Client/LoginForm/LoginForm';

export default function Login(where) {
    return (
        <div className="flex flex-col max-w-md p-6 rounded-md sm:p-10 bg-white text-gray-800 shadow-lg">
            <div className="mb-8 text-center">
                <h1 className="my-3 text-4xl font-bold">Sign in</h1>
                <p className="text-sm text-gray-600">
                    Sign in to access your account
                </p>
            </div>
            <LoginForm />
        </div>
    );
}
