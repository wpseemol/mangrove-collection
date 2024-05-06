import RegisterForm from '../Components/Client/RegisterForm/RegisterForm';

export default function RegisterPage() {
    return (
        <main className="flex items-center justify-center sm:p-8 py-8">
            <div className="flex flex-col sm:max-w-md p-6 rounded-md sm:p-10 bg-white text-gray-800 shadow-lg">
                <div className="mb-8 text-center">
                    <h1 className="my-3 text-4xl font-bold">Sign Up</h1>
                    <p className="text-sm text-gray-600">Register Account</p>
                </div>
                <RegisterForm />
            </div>
        </main>
    );
}
