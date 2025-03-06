'use client';
import { FaFacebookF, FaTwitter } from 'react-icons/fa6';
import { GrLinkedinOption } from 'react-icons/gr';
import {
    FacebookShareButton,
    LinkedinShareButton,
    TwitterShareButton,
} from 'react-share';

interface SocialShareBtnType {
    title: string;
    description: string;
}

export default function SocialShareBtn({
    description,
    title,
}: SocialShareBtnType) {
    const fullUrl =
        typeof window !== 'undefined'
            ? window.location.href
            : 'URL_NOT_AVAILABLE';

    return (
        <div className="flex md:justify-start justify-center items-center gap-3 mt-4">
            <FacebookShareButton
                url={fullUrl}
                title={title}
                hashtag={'#mangrove_collection'}
                className="Demo__some-network__share-button flex flex-col justify-center items-center">
                <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                    <FaFacebookF />
                </span>
            </FacebookShareButton>

            <TwitterShareButton
                title={title}
                url={fullUrl}
                hashtags={['mangrove_collection']}
                className="flex flex-col justify-center items-center">
                <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                    <FaTwitter />
                </span>
            </TwitterShareButton>

            <LinkedinShareButton
                title={title}
                summary={description}
                className="flex flex-col justify-center items-center"
                url={fullUrl}>
                <span className="text-primary-foreground hover:text-primary h-8 w-8 rounded-full border border-primary-foreground hover:border-primary duration-200 flex items-center justify-center">
                    <GrLinkedinOption />
                </span>
            </LinkedinShareButton>
        </div>
    );
}
