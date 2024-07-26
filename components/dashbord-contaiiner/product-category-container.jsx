import { cn } from '@/lib/utils';

export default function ProductCategoryContainer({
    children,
    title,
    className,
}) {
    return (
        <section
            className={cn(
                'md:col-span-2 shadow border border-neutral-500/30 rounded',
                className
            )}>
            <header className="border-b border-neutral-500/30">
                <h2 className="font-semibold text-lg p-3">{title}</h2>
            </header>

            <section className="p-3">{children}</section>
        </section>
    );
}
