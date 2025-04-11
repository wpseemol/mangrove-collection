import { Card } from '@/components/ui/card';
import { Feature } from '@/types/home';
import { BsFilterSquare } from 'react-icons/bs';
import { ImWhatsapp } from 'react-icons/im';
import { MdOutlineMessage } from 'react-icons/md';

export default function FeatureSection() {
    return (
        <section className="md:py-10 pt-5">
            <div
                className={`${
                    otherInfo.length > 3
                        ? 'grid md:grid-cols-4 grid-cols-2'
                        : 'flex justify-center flex-wrap'
                }    md:gap-14 gap-5 p-2`}>
                {otherInfo.map((info) => (
                    <Card
                        key={info.id}
                        className="bg-card px-5 py-2 rounded-sm group cursor-pointer">
                        <div className="flex gap-4 items-center">
                            <div className="w-12 h-12 rounded-full bg-primary text-neutral-200 flex justify-center items-center text-xl group-hover:scale-110 duration-200">
                                {info.icon}
                            </div>
                            <div>
                                <h2 className="text-secondary-foreground font-medium">
                                    {info.title}
                                </h2>
                                <p className="text-muted-foreground">
                                    {info.description}
                                </p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>
        </section>
    );
}

const otherInfo: Feature[] = [
    {
        id: '1',
        icon: <BsFilterSquare />,
        title: 'Outfit Finder',
        description: 'Find Outfit for product',
    },
    {
        id: '2',
        icon: <MdOutlineMessage />,
        title: 'Share Experience',
        description: 'We value you feedback',
    },
    {
        id: '3',
        icon: <ImWhatsapp />,
        title: 'Online Support',
        description: 'Get support on WhatsApp',
    },
];
