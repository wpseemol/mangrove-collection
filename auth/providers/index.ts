import { Provider } from '@auth/core/providers';
import { credentialsProvider } from './credential-provider';

const providers: Provider[] = [credentialsProvider];

export { providers };
