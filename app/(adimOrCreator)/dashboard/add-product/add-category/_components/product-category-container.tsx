import { cn } from '@/lib/utils';

export default function ProductCategoryContainer({
    children,
    title,
    className,
}: {
    children: React.ReactNode;
    title: string;
    className: string;
}) {
    return (
        <section
            className={cn(
                'w-full shadow border border-neutral-500/30 rounded mb-4',
                className
            )}>
            <header className="border-b border-neutral-500/30">
                <h2 className="font-semibold text-lg md:p-3 p-2">{title}</h2>
            </header>

            <section className="md:p-3 p-2">{children}</section>
        </section>
    );
}
