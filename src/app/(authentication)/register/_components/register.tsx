import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import RegisterForm from './register-form';

export default function RegisterSection() {
    return (
        <Card className="mx-auto max-w-md md:min-w-[26rem]">
            <CardHeader>
                <CardTitle className="text-xl text-center">Sign Up</CardTitle>
                <CardDescription className="text-center">
                    Enter your information to create an account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <RegisterForm />
            </CardContent>
        </Card>
    );
}
