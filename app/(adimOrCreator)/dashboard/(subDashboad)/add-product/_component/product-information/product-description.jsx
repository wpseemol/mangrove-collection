'use client';

import '@/app/react-quill-style.css';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
import Loading from '../form-loading';

const ReactQuill = dynamic(() => import('react-quill'), {
    ssr: false,
    loading: () => <Loading />,
});

export default function Description({ form }) {
    return (
        <>
            <FormField
                control={form.control}
                name="description"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="mb-1">Description*</FormLabel>

                        <FormControl>
                            <ReactQuill
                                theme="snow"
                                value={field.value}
                                onChange={field.onChange}
                                formats={formats}
                                modules={modules}
                            />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}

const formats = [
    'header',
    'font',
    'bold',
    'italic',
    'underline',
    'strike',
    'blockquote',
    'list',
    'bullet',
    'indent',
    'link',
    'image',
    'video',
    'align',
];

const modules = {
    toolbar: [
        [{ header: [1, 2, 3, 4, 5, 6, false] }, { font: [] }],
        [{ list: 'ordered' }, { list: 'bullet' }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ align: [] }],
        ['link', 'image', 'video'],
        ['clean'], // remove formatting button
    ],
};
