import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Image from 'next/image';

export default function UserAvatar({
    imgUrl,
    fullName,
}: {
    imgUrl: string | null | undefined;
    fullName: string;
}) {
    const nameFirstLetter = fullName.charAt(0);
    return (
        <Avatar className="group">
            {imgUrl && (
                <Image
                    src={imgUrl}
                    width={38}
                    height={38}
                    alt={fullName}
                    className="w-auto h-auto group-hover:scale-110 duration-150"
                />
            )}
            <AvatarFallback className="border">
                {nameFirstLetter}
            </AvatarFallback>
        </Avatar>
    );
}
