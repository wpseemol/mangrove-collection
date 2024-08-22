import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import LoginForm from './login-form';

export default function LoginSection() {
    return (
        <Card className="">
            <CardHeader>
                <CardTitle className="text-center">Sign in</CardTitle>
                <CardDescription className="text-center">
                    Sign in to access your account.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <LoginForm />
            </CardContent>
        </Card>
    );
}
