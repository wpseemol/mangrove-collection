import RegisterForm from '../Client/RegisterForm/RegisterForm';

export default function Register() {
    return (
        <div className="flex flex-col sm:max-w-md p-6 rounded-md sm:p-10 bg-white text-gray-800 shadow-lg">
            <div className="mb-8 text-center">
                <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
                <p className="text-sm text-gray-600">Register Account</p>
            </div>
            <RegisterForm />
        </div>
    );
}
