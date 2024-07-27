import CategorySelect from './other-information/category-select';

export default function OtherInformation({ form, allCategory }) {
    return (
        <>
            <section className="mb-4">
                <CategorySelect form={form} allCategory={allCategory} />
            </section>
        </>
    );
}
