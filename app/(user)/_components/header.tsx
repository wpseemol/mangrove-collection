import FullScreen from './nav/full-screen';
import MobileScreen from './nav/mobile-screen';

export default function Header() {
    return (
        <header>
            <FullScreen />
            <MobileScreen />
        </header>
    );
}
