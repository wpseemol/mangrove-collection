import { SearchParamsType } from "../page";

export default function ProductSection({searchParamsData}:{searchParamsData:SearchParamsType}) {
    return (
        <div>
            {JSON.stringify(searchParamsData)}
        </div>
    );
};