import gsap from 'gsap';

export function animationPageIn() {
    const bannerOne = document.getElementById('banner-1');
    const bannerTwo = document.getElementById('banner-2');
    const bannerThree = document.getElementById('banner-3');
    const bannerFour = document.getElementById('banner-4');

    if (bannerOne && bannerTwo && bannerThree && bannerFour) {
        const tl = gsap.timeline();

        tl.set([bannerOne, bannerTwo, bannerThree, bannerFour], {
            yPercent: 0,
        }).to([bannerOne, bannerTwo, bannerThree, bannerFour], {
            yPercent: 100,
            stagger: 0.15,
            onComplete: () => {
                bannerOne.remove();
                bannerTwo.remove();
                bannerThree.remove();
                bannerFour.remove();
            },
        });
    }
}

export function animatePageOut(href, router) {
    const banners = [
        createBanner('left-0', 'banner-1'),
        createBanner('left-1/4', 'banner-2'),
        createBanner('left-2/4', 'banner-3'),
        createBanner('left-3/4', 'banner-4'),
    ];

    banners.forEach((banner) => {
        document.body.appendChild(banner);
    });

    const tl = gsap.timeline();

    tl.set(banners, {
        yPercent: -100,
    }).to(banners, {
        yPercent: 0,
        stagger: 0.15,
        onComplete: () => {
            router.push(href);
            animationPageIn();
        },
    });
}

function createBanner(className = '', idName) {
    const banner = document.createElement('div');
    banner.id = idName;
    banner.classList.add(
        className,
        'min-h-screen',
        'bg-neutral-900',
        'z-[100]',
        'fixed',
        'top-0',
        'w-1/4'
    );

    return banner;
}
