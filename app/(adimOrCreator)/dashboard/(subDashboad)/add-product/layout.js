import TabBtn from './_component/tab-btn';

export default function AddProductOrCategoryLayout({ children }) {
    return (
        <>
            <>
                <header className="md:mb-4 mb-2 border-b dark:border-b-slate-50/20">
                    <nav className="flex ml-4 items-center gap-2 border-b-0">
                        <TabBtn
                            href="/dashboard/add-product"
                            title="Add Product"
                        />
                        <TabBtn
                            href="/dashboard/add-product/add-category"
                            title="Add category"
                        />
                    </nav>
                </header>

                {children}
            </>
        </>
    );
}
