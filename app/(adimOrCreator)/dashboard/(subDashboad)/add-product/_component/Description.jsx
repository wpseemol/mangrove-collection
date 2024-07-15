'use client';

import '@/app/react-quill-style.css';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

export default function Description({ descriptionValue, setDescriptionValue }) {
    const formats = [
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
        'header',
    ];

    const modules = {
        toolbar: [
            [{ header: [] }, { font: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
            [{ align: [] }],
            ['link', 'image', 'video'],
            ['clean'], // remove formatting button
        ],
    };

    return (
        <ReactQuill
            className="h-[20rem] mt-2 
               "
            theme="snow"
            value={descriptionValue}
            onChange={setDescriptionValue}
            formats={formats}
            modules={modules}></ReactQuill>
    );
}
